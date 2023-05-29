# DataForMapLocationEvent [rpc]

Notifies application that a click on the map resulted in more data for that location (GFI style content).

## Description

The event allows applications to get programmatic access to the content that is normally shown on the map in an `infobox` popup when the user clicks the map (GFI/wfs feature clicks). Event includes information about the click coordinates and content of the GFI response.

Note! This event is triggered for each layer and vector feature that is hit. You can detect if the events are from the same click by comparing coordinates

## Parameters

(* means the parameter is required)

<table class="table">
<tr>
  <th> Name</th><th> Type</th><th> Description</th><th> Default value</th>
</tr>
<tr>
  <td> \* x</td><td> Number </td><td> clicked x coordinate </td><td> </td>
</tr>
<tr>
  <td> \* y </td><td> Number </td><td> clicked y coordinate </td><td> </td>
</tr>
<tr>
  <td> \* content </td><td> String/Object </td><td> GFI content </td><td> </td>
</tr>
<tr>
  <td> \* layerId </td><td> Integer </td><td> Layer id which reposonse come </td><td> </td>
</tr>
<tr>
  <td> \* type </td><td> String </td><td> GFI response type, can be: json, geojson, text </td><td> </td>
</tr>
</table>

## RPC

Event occurs when GFI response come.

<pre class="event-code-block">
<code>
{
  "content": "<table><tr><td>test</td></tr></table>", // or json object
  "x": 423424,
  "y": 6652055,
  "layerId": 1,
  "type": "text" // or json or geojson
}
</code>
</pre>

## Event methods

### getName()
Returns name of the

### getX()
Returns x coordinate

### getY()
Returns y coordinate

### getContent()
Returns content, can be: json, geojson or text

### getLayerId()
Returns GFI response layer id

### getType()
Returns content type, can be: json, geojson or text

### getParams()
Returns object including all the parameters, for example:
<pre class="event-code-block">
<code>
{
    x: this.getX(),
    y: this.getY(),
    content: this.getContent(),
    layerId: this.getLayerId(),
    type: this.getType()
};
</code>
</pre>

## Examples

GetInfoPlugin send DataForMapLocationEvent:
<pre class="event-code-block">
<code>
var dataForMapLocationEvent = Oskari.eventBuilder(
    'DataForMapLocationEvent'
)(data.lonlat.lon, data.lonlat.lat, content, feature.layerId, type);
this.getSandbox().notifyAll(dataForMapLocationEvent);
</code>
</pre>
