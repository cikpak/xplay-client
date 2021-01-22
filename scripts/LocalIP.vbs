strComputer = "."
Set objWMIService = GetObject("winmgmts:" & "{impersonationLevel=impersonate}!\\" & strComputer & "\root\cimv2")
Set IPAdapterSet = objWMIService.ExecQuery("Select MACAddress from Win32_NetworkAdapter WHERE PhysicalAdapter=TRUE AND NetEnabled=TRUE")

For Each IPConfig in IPAdapterSet
	Set IPConfigSet = objWMIService.ExecQuery( _
		"Select IPAddress, DNSServerSearchOrder from Win32_NetworkAdapterConfiguration where IPEnabled='True' AND MACAddress = '" & IPConfig.MACAddress & "'")
	For Each IPConf in IPConfigSet
		If Not IsNull(IPConf.IPAddress) Then
			if Not IsNUll(IPConf.DNSServerSearchOrder) then
				WScript.Echo("MyIp:" & IPConf.IPAddress(0))
			end if
		End If
	next
Next
