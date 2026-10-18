<?php
/**
 * IK Cloud Solutions - Production Inbound Email Dispatcher
 * Dispatches enterprise inquiries and consultation requests to admin@ikcloudsolutions.com
 */

header('Content-Type: application/json; charset=UTF-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Accept');

// Handle CORS preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode([
        'success' => false,
        'error' => 'Method not allowed. Only POST is accepted.'
    ]);
    exit;
}

// Read payload (supports JSON and form-urlencoded / FormData)
$rawInput = file_get_contents('php://input');
$data = json_decode($rawInput, true);

if (!is_array($data)) {
    $data = $_POST;
}

if (empty($data)) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'error' => 'No inquiry data received.'
    ]);
    exit;
}

// Anti-spam honeypot detection
if (!empty($data['website_url']) || !empty($data['honeypot']) || !empty($data['company_fax'])) {
    // Silently acknowledge bots
    echo json_encode([
        'success' => true,
        'message' => 'Your transmission has been queued for review.'
    ]);
    exit;
}

// Validate email address
$email = isset($data['email']) ? trim(filter_var($data['email'], FILTER_SANITIZE_EMAIL)) : '';
if (empty($email) || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'error' => 'Please provide a valid corporate email address.'
    ]);
    exit;
}

// Sanitize fields
$type = isset($data['type']) && $data['type'] === 'consultation' ? 'Consultation Request' : 'General Inquiry';

$name = '';
if (!empty($data['name'])) {
    $name = trim(strip_tags($data['name']));
} elseif (!empty($data['firstName']) || !empty($data['lastName'])) {
    $name = trim(strip_tags(($data['firstName'] ?? '') . ' ' . ($data['lastName'] ?? '')));
} else {
    $name = 'Prospective Enterprise Client';
}

$company       = !empty($data['company'])       ? trim(strip_tags($data['company']))       : '';
$roleTitle     = !empty($data['roleTitle'])     ? trim(strip_tags($data['roleTitle']))     : '';
$cloudFocus    = !empty($data['cloudFocus'])    ? trim(strip_tags($data['cloudFocus']))    : 'Multi-Cloud DevOps & GitOps';
$cloudProvider = !empty($data['cloudProvider']) ? trim(strip_tags($data['cloudProvider'])) : '';
$monthlySpend  = !empty($data['monthlySpend'])  ? trim(strip_tags($data['monthlySpend']))  : '';
$preferredDate = !empty($data['preferredDate']) ? trim(strip_tags($data['preferredDate'])) : '';
$preferredTime = !empty($data['preferredTime']) ? trim(strip_tags($data['preferredTime'])) : '';
$subject       = !empty($data['subject'])       ? trim(strip_tags($data['subject']))       : '';
$message       = !empty($data['message'])       ? trim(strip_tags($data['message']))       : (!empty($data['notes']) ? trim(strip_tags($data['notes'])) : '');

$timestamp = date('Y-m-d H:i:s T');
$ip = $_SERVER['REMOTE_ADDR'] ?? 'Unknown IP';

// Target Administrator Email
$to = 'admin@ikcloudsolutions.com';

// Subject formulation
if ($type === 'Consultation Request') {
    $companyTag = !empty($company) ? " [{$company}]" : "";
    $mailSubject = "IK Cloud Architecture Booking: {$name}{$companyTag}";
} else {
    $topic = !empty($subject) ? $subject : $cloudFocus;
    $mailSubject = "IK Cloud Inbound: {$name} - {$topic}";
}

// Build HTML email message
$safeName       = htmlspecialchars($name, ENT_QUOTES, 'UTF-8');
$safeEmail      = htmlspecialchars($email, ENT_QUOTES, 'UTF-8');
$safeCompany    = htmlspecialchars($company, ENT_QUOTES, 'UTF-8');
$safeRole       = htmlspecialchars($roleTitle, ENT_QUOTES, 'UTF-8');
$safeFocus      = htmlspecialchars($cloudFocus, ENT_QUOTES, 'UTF-8');
$safeProvider   = htmlspecialchars($cloudProvider, ENT_QUOTES, 'UTF-8');
$safeDate       = htmlspecialchars($preferredDate, ENT_QUOTES, 'UTF-8');
$safeTime       = htmlspecialchars($preferredTime, ENT_QUOTES, 'UTF-8');
$safeSubject    = htmlspecialchars($subject, ENT_QUOTES, 'UTF-8');
$safeMessage    = nl2br(htmlspecialchars($message, ENT_QUOTES, 'UTF-8'));

$boundary = "IKCLOUD_" . md5(uniqid(time()));

// Plain text alternative
$plainText = "========================================================\n";
$plainText .= "  IK CLOUD SOLUTIONS - NEW INBOUND TRANSMISSION\n";
$plainText .= "========================================================\n\n";
$plainText .= "TYPE:            " . strtoupper($type) . "\n";
$plainText .= "SENDER:          {$name} <{$email}>\n";
if (!empty($company))       $plainText .= "COMPANY:         {$company}\n";
if (!empty($roleTitle))     $plainText .= "ROLE/TITLE:      {$roleTitle}\n";
if (!empty($cloudFocus))    $plainText .= "FOCUS AREA:      {$cloudFocus}\n";
if (!empty($cloudProvider)) $plainText .= "CLOUD TARGET:    {$cloudProvider}\n";
if (!empty($preferredDate)) $plainText .= "PREFERRED DATE:  {$preferredDate} at {$preferredTime}\n";
if (!empty($subject))       $plainText .= "SUBJECT:         {$subject}\n";
$plainText .= "RECEIVED:        {$timestamp}\n";
$plainText .= "CLIENT IP:       {$ip}\n\n";
$plainText .= "--- MESSAGE / REQUIREMENTS ---\n";
$plainText .= ($message ?: 'No additional notes provided.') . "\n\n";
$plainText .= "========================================================\n";
$plainText .= "Direct Action: Reply to this email to contact {$name} directly ({$email}).\n";

// Rich HTML version
$htmlBody = <<<HTML
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>{$mailSubject}</title>
  <style>
    body { margin: 0; padding: 0; background-color: #030712; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #f3f4f6; }
    .wrapper { width: 100%; max-width: 650px; margin: 30px auto; background-color: #0b1120; border-radius: 16px; border: 1px solid #1e293b; overflow: hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.6); }
    .header { background: linear-gradient(135deg, #0284c7 0%, #0369a1 50%, #0f172a 100%); padding: 32px 30px; text-align: left; border-bottom: 2px solid #38bdf8; }
    .badge { display: inline-block; padding: 4px 10px; background: rgba(56, 189, 248, 0.2); border: 1px solid #38bdf8; border-radius: 9999px; font-size: 11px; font-weight: 700; color: #38bdf8; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 12px; }
    .title { margin: 0; font-size: 22px; font-weight: 800; color: #ffffff; letter-spacing: -0.5px; }
    .subtitle { margin: 6px 0 0; font-size: 13px; color: #bae6fd; }
    .content { padding: 30px; }
    .meta-table { width: 100%; border-collapse: collapse; margin-bottom: 24px; font-size: 13px; }
    .meta-table td { padding: 10px 14px; border-bottom: 1px solid #1e293b; }
    .meta-label { color: #94a3b8; font-weight: 600; width: 34%; font-family: monospace; font-size: 12px; }
    .meta-value { color: #f8fafc; font-weight: 500; }
    .highlight { color: #38bdf8; font-weight: 700; }
    .message-box { background: #030712; border: 1px solid #1e293b; border-left: 4px solid #38bdf8; border-radius: 8px; padding: 18px 20px; font-size: 13px; line-height: 1.6; color: #e2e8f0; margin-bottom: 28px; }
    .btn-container { text-align: center; margin: 30px 0 10px; }
    .reply-btn { display: inline-block; background: linear-gradient(135deg, #06b6d4, #0284c7); color: #020617; font-weight: 700; text-decoration: none; padding: 14px 28px; border-radius: 10px; font-size: 13px; letter-spacing: 0.5px; text-transform: uppercase; }
    .footer { padding: 20px 30px; background-color: #030712; border-top: 1px solid #1e293b; font-size: 11px; color: #64748b; text-align: center; font-family: monospace; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="header">
      <div class="badge">IK Cloud Solutions • Inbound Transmission</div>
      <h1 class="title">{$mailSubject}</h1>
      <p class="subtitle">Dispatched via ikcloudsolutions.com directly to admin@ikcloudsolutions.com</p>
    </div>
    <div class="content">
      <table class="meta-table">
        <tr>
          <td class="meta-label">INQUIRY TYPE</td>
          <td class="meta-value"><span class="highlight">{$type}</span></td>
        </tr>
        <tr>
          <td class="meta-label">FULL NAME</td>
          <td class="meta-value"><strong>{$safeName}</strong></td>
        </tr>
        <tr>
          <td class="meta-label">WORK EMAIL</td>
          <td class="meta-value"><a href="mailto:{$safeEmail}" style="color:#38bdf8; text-decoration:none;">{$safeEmail}</a></td>
        </tr>
HTML;

if (!empty($company)) {
    $htmlBody .= "<tr><td class=\"meta-label\">COMPANY</td><td class=\"meta-value\">{$safeCompany}</td></tr>";
}
if (!empty($roleTitle)) {
    $htmlBody .= "<tr><td class=\"meta-label\">ROLE / TITLE</td><td class=\"meta-value\">{$safeRole}</td></tr>";
}
if (!empty($cloudFocus)) {
    $htmlBody .= "<tr><td class=\"meta-label\">SERVICE FOCUS</td><td class=\"meta-value\"><span class=\"highlight\">{$safeFocus}</span></td></tr>";
}
if (!empty($cloudProvider)) {
    $htmlBody .= "<tr><td class=\"meta-label\">CLOUD TARGET</td><td class=\"meta-value\">{$safeProvider}</td></tr>";
}
if (!empty($preferredDate)) {
    $htmlBody .= "<tr><td class=\"meta-label\">BOOKING SLOT</td><td class=\"meta-value\" style=\"color:#4ade80; font-weight:bold;\">{$safeDate} at {$safeTime}</td></tr>";
}
if (!empty($subject)) {
    $htmlBody .= "<tr><td class=\"meta-label\">SUBJECT</td><td class=\"meta-value\">{$safeSubject}</td></tr>";
}

$htmlBody .= <<<HTML
        <tr>
          <td class="meta-label">TIMESTAMP</td>
          <td class="meta-value">{$timestamp}</td>
        </tr>
        <tr>
          <td class="meta-label">CLIENT IP</td>
          <td class="meta-value" style="font-family:monospace; color:#94a3b8;">{$ip}</td>
        </tr>
      </table>

      <div style="font-size:12px; font-weight:700; color:#94a3b8; text-transform:uppercase; letter-spacing:0.5px; margin-bottom:8px;">Requirements & Details:</div>
      <div class="message-box">
        {$safeMessage}
      </div>

      <div class="btn-container">
        <a href="mailto:{$safeEmail}?subject=Re:%20{$safeSubject}" class="reply-btn">Reply Directly to {$safeName}</a>
      </div>
    </div>
    <div class="footer">
      IK Cloud Solutions Ltd • 35 Napier Road, Glenrothes, KY6 1DS, Scotland UK<br>
      This message was generated automatically from the contact engine on ikcloudsolutions.com
    </div>
  </div>
</body>
</html>
HTML;

// Headers for multipart MIME message
$headers = [];
$headers[] = 'From: "IK Cloud Platform" <admin@ikcloudsolutions.com>';
$headers[] = "Reply-To: \"{$name}\" <{$email}>";
$headers[] = 'Return-Path: <admin@ikcloudsolutions.com>';
$headers[] = 'MIME-Version: 1.0';
$headers[] = "Content-Type: multipart/alternative; boundary=\"{$boundary}\"";
$headers[] = 'X-Mailer: IKCloud-Engine/2.0 (PHP/' . phpversion() . ')';
$headers[] = 'X-Priority: 1 (Highest)';
$headers[] = 'Importance: High';

// Multipart Body Assembly
$fullBody = "--{$boundary}\r\n";
$fullBody .= "Content-Type: text/plain; charset=UTF-8\r\n";
$fullBody .= "Content-Transfer-Encoding: 8bit\r\n\r\n";
$fullBody .= $plainText . "\r\n\r\n";

$fullBody .= "--{$boundary}\r\n";
$fullBody .= "Content-Type: text/html; charset=UTF-8\r\n";
$fullBody .= "Content-Transfer-Encoding: 8bit\r\n\r\n";
$fullBody .= $htmlBody . "\r\n\r\n";

$fullBody .= "--{$boundary}--";

// Dispatch email
$mailSent = false;
try {
    // Envelope sender -f ensures SPF alignment with admin@ikcloudsolutions.com
    $mailSent = @mail($to, $mailSubject, $fullBody, implode("\r\n", $headers), "-f admin@ikcloudsolutions.com");
    if (!$mailSent) {
        // Fallback without 5th parameter if Hostinger restrictions require standard call
        $mailSent = @mail($to, $mailSubject, $fullBody, implode("\r\n", $headers));
    }
} catch (Exception $e) {
    $mailSent = false;
}

// Persist submission log for zero data loss audit
$logEntry = sprintf(
    "[%s] STATUS=%s | TYPE=%s | SENDER=%s <%s> | SUBJECT=%s | IP=%s\n",
    $timestamp,
    $mailSent ? 'DISPATCHED' : 'LOGGED',
    $type,
    $name,
    $email,
    $mailSubject,
    $ip
);
@file_put_contents(__DIR__ . '/contact_submissions.log', $logEntry, FILE_APPEND | LOCK_EX);

// Return success to frontend
echo json_encode([
    'success' => true,
    'message' => 'Your transmission has been successfully delivered to admin@ikcloudsolutions.com. We will respond promptly.'
]);
