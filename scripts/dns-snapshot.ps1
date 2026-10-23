<#
.SYNOPSIS
  Takes a read-only snapshot of the DNS records that matter for the Hostinger to Vercel cutover.

.DESCRIPTION
  Runs Resolve-DnsName for A, AAAA, CNAME, MX, TXT, NS and CAA at the apex and at the host names
  below, and writes the results to a text file. It only reads DNS: it never changes anything.
  Take one BEFORE any change, one after adding the Resend records, and one after the cutover, then
  compare them with:  fc dns-after-resend.txt dns-after.txt   (or: git diff --no-index a b)
  Store the files outside git.

.PARAMETER Domain
  The apex domain, for example ikcloudsolutions.com.

.PARAMETER Out
  The file to write, for example dns-before.txt. An existing file is overwritten.

.EXAMPLE
  .\scripts\dns-snapshot.ps1 -Domain ikcloudsolutions.com -Out dns-before.txt
#>
[CmdletBinding()]
param(
  [Parameter(Mandatory = $true)]
  [ValidatePattern('^[A-Za-z0-9]([A-Za-z0-9-]*[A-Za-z0-9])?(\.[A-Za-z0-9]([A-Za-z0-9-]*[A-Za-z0-9])?)+$')]
  [string]$Domain,

  [Parameter(Mandatory = $true)]
  [string]$Out
)

$ErrorActionPreference = 'Stop'

# '@' is the apex. Names are relative to the domain. The Resend sending-domain hosts are included
# so the step 2b snapshot captures them.
$Hosts = @('@', 'www', '_dmarc', 'send', 'resend._domainkey.send', 'mail', 'autodiscover', 'autoconfig')
$Types = @('A', 'AAAA', 'CNAME', 'MX', 'TXT', 'NS', 'CAA')

$lines = New-Object System.Collections.Generic.List[string]
$lines.Add("DNS snapshot for $Domain")
$lines.Add('Records are sorted so two snapshots can be compared with fc or git diff --no-index.')
$lines.Add('')

foreach ($hostLabel in $Hosts) {
  $name = if ($hostLabel -eq '@') { $Domain } else { "$hostLabel.$Domain" }
  foreach ($type in $Types) {
    $lines.Add("== $name  $type")
    try {
      $records = Resolve-DnsName -Name $name -Type $type -DnsOnly -ErrorAction Stop |
        Where-Object { $_.Type -eq $type }
      if (-not $records) {
        $lines.Add('(no record)')
        continue
      }
      $rendered = foreach ($record in $records) {
        switch ($type) {
          'A'     { $record.IPAddress }
          'AAAA'  { $record.IPAddress }
          'CNAME' { $record.NameHost }
          'MX'    { "$($record.Preference) $($record.NameExchange)" }
          'TXT'   { ($record.Strings -join '') }
          'NS'    { $record.NameHost }
          'CAA'   { "$($record.Flags) $($record.Tag) $($record.Value)" }
        }
      }
      # TTL is deliberately left out: it counts down between runs and would create noise in a diff.
      foreach ($value in ($rendered | Sort-Object)) { $lines.Add($value) }
    }
    catch {
      $lines.Add('(no record)')
    }
  }
  $lines.Add('')
}

Set-Content -LiteralPath $Out -Value $lines -Encoding UTF8
Write-Host "Wrote $($lines.Count) lines to $Out at $([DateTime]::UtcNow.ToString('yyyy-MM-dd HH:mm:ss')) UTC"
