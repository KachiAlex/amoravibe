Get-CimInstance Win32_Process | Where-Object { $_.Name -like 'node*' } | Select-Object ProcessId, CommandLine | Format-List
