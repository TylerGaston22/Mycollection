<diagram program="umletino" version="15.1"><zoom_level>7</zoom_level><help_text>// Uncomment the following line to change the fontsize and font:
fontsize=8
fontfamily=Monospaced //possible: SansSerif,Serif,Monospaced


//////////////////////////////////////////////////////////////////////////////////////////////
// Welcome to UMLet!
//
// Double-click on elements to add them to the diagram, or to copy them
// Edit elements by modifying the text in this panel
// Hold Cmd to select multiple elements
// Use Cmd+mouse to select via lasso
//
// Use +/- or Cmd+mouse wheel to zoom
// Drag a whole relation at its central square icon
//
// Press Cmd+C to copy the whole diagram to the system clipboard (then just paste it to, eg, Word)
// Edit the files in the "palettes" directory to create your own element palettes
//
// Select "Custom Elements &gt; New..." to create new element types
//////////////////////////////////////////////////////////////////////////////////////////////


// This text will be stored with each diagram;  use it for notes.</help_text><element><id>UMLClass</id><coordinates><x>287</x><y>105</y><w>70</w><h>70</h></coordinates><panel_attributes>Person
--
_PersonID_
FName
LName
</panel_attributes><additional_attributes></additional_attributes></element><element><id>UMLClass</id><coordinates><x>224</x><y>280</y><w>70</w><h>70</h></coordinates><panel_attributes>Author
--
_AuthorID_

</panel_attributes><additional_attributes></additional_attributes></element><element><id>UMLClass</id><coordinates><x>329</x><y>294</y><w>84</w><h>84</h></coordinates><panel_attributes>Customer
--
_CustomerID_
Username
PasswordHash
JoinDate
EmailAddress

</panel_attributes><additional_attributes></additional_attributes></element><element><id>Text</id><coordinates><x>280</x><y>210</y><w>77</w><h>42</h></coordinates><panel_attributes>isa
subclass
/// DO NOT EDIT THE CODE BELOW
customelement=
//arithmetical skills
drawLine(width/2,0,0,height-1)
drawLine(0,height, width,height)
drawLine(width,height, width/2,0)
halign=center
valign=center
</panel_attributes><additional_attributes></additional_attributes></element><element><id>Relation</id><coordinates><x>294</x><y>168</y><w>28</w><h>77</h></coordinates><panel_attributes>lt=-</panel_attributes><additional_attributes>20;10;10;90</additional_attributes></element><element><id>Relation</id><coordinates><x>252</x><y>245</y><w>63</w><h>49</h></coordinates><panel_attributes>lt=-</panel_attributes><additional_attributes>70;10;10;50</additional_attributes></element><element><id>Relation</id><coordinates><x>336</x><y>245</y><w>28</w><h>63</h></coordinates><panel_attributes>lt=-</panel_attributes><additional_attributes>10;10;20;70</additional_attributes></element><element><id>UMLClass</id><coordinates><x>161</x><y>476</y><w>70</w><h>70</h></coordinates><panel_attributes>Book
--
_BookID_
Title</panel_attributes><additional_attributes></additional_attributes></element><element><id>UMLClass</id><coordinates><x>441</x><y>476</y><w>77</w><h>77</h></coordinates><panel_attributes>Edition
--
_EditionID_
Name
</panel_attributes><additional_attributes></additional_attributes></element><element><id>Text</id><coordinates><x>266</x><y>469</y><w>119</w><h>98</h></coordinates><panel_attributes>_BookEdition_
ISBN
WholesalePrice
RetailPrice
Quantity

/// DO NOT EDIT THE CODE BELOW
customelement=
//arithmetical skills
drawLine(width/2,0,width,height/2)
drawLine(width,height/2,width/2,height)
drawLine(width/2,height,0,height/2)
drawLine(0,height/2,width/2,0)
halign=center
valign=center

lw=1
</panel_attributes><additional_attributes></additional_attributes></element><element><id>Relation</id><coordinates><x>378</x><y>511</y><w>77</w><h>28</h></coordinates><panel_attributes>lt=-
lw=3</panel_attributes><additional_attributes>10;10;90;20</additional_attributes></element><element><id>Relation</id><coordinates><x>224</x><y>504</y><w>56</w><h>28</h></coordinates><panel_attributes>lt=-
lw=3</panel_attributes><additional_attributes>10;10;60;20</additional_attributes></element><element><id>Text</id><coordinates><x>147</x><y>455</y><w>392</w><h>126</h></coordinates><panel_attributes>
/// DO NOT EDIT THE CODE BELOW
customelement=
//arithmetical skills
drawLine(0,0,width,0) lt=.
drawLine(width,0,width,height) lt=.
drawLine(width,height,0,height)  lt=.
drawLine(0,height,0,0) lt=.
halign=center
valign=center
lw=3
</panel_attributes><additional_attributes></additional_attributes></element><element><id>Text</id><coordinates><x>133</x><y>357</y><w>91</w><h>70</h></coordinates><panel_attributes>_WrittenBy_

/// DO NOT EDIT THE CODE BELOW
customelement=
//arithmetical skills
drawLine(width/2,0,width,height/2)
drawLine(width,height/2,width/2,height)
drawLine(width/2,height,0,height/2)
drawLine(0,height/2,width/2,0)
halign=center
valign=center

lw=1
</panel_attributes><additional_attributes></additional_attributes></element><element><id>Relation</id><coordinates><x>196</x><y>329</y><w>42</w><h>63</h></coordinates><panel_attributes>lt=-</panel_attributes><additional_attributes>10;70;40;10</additional_attributes></element><element><id>Relation</id><coordinates><x>196</x><y>399</y><w>35</w><h>91</h></coordinates><panel_attributes>lt=-
lw=3</panel_attributes><additional_attributes>10;10;30;110</additional_attributes></element><element><id>UMLClass</id><coordinates><x>497</x><y>42</y><w>84</w><h>77</h></coordinates><panel_attributes>Order
--
_OrderID_

</panel_attributes><additional_attributes></additional_attributes></element><element><id>Text</id><coordinates><x>497</x><y>140</y><w>77</w><h>42</h></coordinates><panel_attributes>isa
subclass
/// DO NOT EDIT THE CODE BELOW
customelement=
//arithmetical skills
drawLine(width/2,0,0,height-1)
drawLine(0,height, width,height)
drawLine(width,height, width/2,0)
halign=center
valign=center
</panel_attributes><additional_attributes></additional_attributes></element><element><id>Relation</id><coordinates><x>511</x><y>112</y><w>28</w><h>63</h></coordinates><panel_attributes>lt=-</panel_attributes><additional_attributes>20;10;10;70</additional_attributes></element><element><id>UMLClass</id><coordinates><x>581</x><y>308</y><w>70</w><h>70</h></coordinates><panel_attributes>Sale
--
_SaleID_
TimeStamp
TotalCost

</panel_attributes><additional_attributes></additional_attributes></element><element><id>Relation</id><coordinates><x>546</x><y>175</y><w>91</w><h>147</h></coordinates><panel_attributes>lt=-</panel_attributes><additional_attributes>10;10;110;190</additional_attributes></element><element><id>UMLClass</id><coordinates><x>483</x><y>203</y><w>70</w><h>63</h></coordinates><panel_attributes>Cart
--
_CartID_


</panel_attributes><additional_attributes></additional_attributes></element><element><id>Relation</id><coordinates><x>511</x><y>175</y><w>28</w><h>42</h></coordinates><panel_attributes>lt=-</panel_attributes><additional_attributes>20;10;10;40</additional_attributes></element><element><id>Relation</id><coordinates><x>532</x><y>308</y><w>315</w><h>217</h></coordinates><panel_attributes>lt=-</panel_attributes><additional_attributes>10;290;420;290;430;10</additional_attributes></element><element><id>Text</id><coordinates><x>805</x><y>252</y><w>91</w><h>70</h></coordinates><panel_attributes>_Contains_
Quantity

/// DO NOT EDIT THE CODE BELOW
customelement=
//arithmetical skills
drawLine(width/2,0,width,height/2)
drawLine(width,height/2,width/2,height)
drawLine(width/2,height,0,height/2)
drawLine(0,height/2,width/2,0)
halign=center
valign=center

lw=1
</panel_attributes><additional_attributes></additional_attributes></element><element><id>Relation</id><coordinates><x>574</x><y>56</y><w>301</w><h>210</h></coordinates><panel_attributes>lt=-</panel_attributes><additional_attributes>400;280;410;10;10;10</additional_attributes></element><element><id>UMLClass</id><coordinates><x>735</x><y>84</y><w>98</w><h>91</h></coordinates><panel_attributes>Discount
--
_DiscountID_
Name
StartDate
EndDate
DollarAmount
PercentageAmount

</panel_attributes><additional_attributes></additional_attributes></element><element><id>Text</id><coordinates><x>609</x><y>91</y><w>91</w><h>70</h></coordinates><panel_attributes>_Contains_


/// DO NOT EDIT THE CODE BELOW
customelement=
//arithmetical skills
drawLine(width/2,0,width,height/2)
drawLine(width,height/2,width/2,height)
drawLine(width/2,height,0,height/2)
drawLine(0,height/2,width/2,0)
halign=center
valign=center

lw=1
</panel_attributes><additional_attributes></additional_attributes></element><element><id>Text</id><coordinates><x>175</x><y>609</y><w>91</w><h>70</h></coordinates><panel_attributes>_PublishedBy_
Date

/// DO NOT EDIT THE CODE BELOW
customelement=
//arithmetical skills
drawLine(width/2,0,width,height/2)
drawLine(width,height/2,width/2,height)
drawLine(width/2,height,0,height/2)
drawLine(0,height/2,width/2,0)
halign=center
valign=center

lw=1
</panel_attributes><additional_attributes></additional_attributes></element><element><id>UMLClass</id><coordinates><x>322</x><y>609</y><w>70</w><h>70</h></coordinates><panel_attributes>Publisher
--
_PublisherID_
Name
</panel_attributes><additional_attributes></additional_attributes></element><element><id>Relation</id><coordinates><x>259</x><y>637</y><w>77</w><h>21</h></coordinates><panel_attributes>lt=-</panel_attributes><additional_attributes>10;10;90;10</additional_attributes></element><element><id>Relation</id><coordinates><x>574</x><y>84</y><w>77</w><h>35</h></coordinates><panel_attributes>lt=&lt;&lt;&lt;-</panel_attributes><additional_attributes>90;30;10;10</additional_attributes></element><element><id>Relation</id><coordinates><x>665</x><y>140</y><w>84</w><h>21</h></coordinates><panel_attributes>lt=-</panel_attributes><additional_attributes>10;10;100;10</additional_attributes></element><element><id>Text</id><coordinates><x>455</x><y>315</y><w>77</w><h>56</h></coordinates><panel_attributes>

_hasSale_



/// DO NOT EDIT THE CODE BELOW
customelement=
//arithmetical skills
drawLine(width/2,0,width,height/2)
drawLine(width,height/2,width/2,height)
drawLine(width/2,height,0,height/2)
drawLine(0,height/2,width/2,0)
halign=center
valign=center

lw=1
</panel_attributes><additional_attributes></additional_attributes></element><element><id>Relation</id><coordinates><x>406</x><y>336</y><w>63</w><h>21</h></coordinates><panel_attributes>lt=-</panel_attributes><additional_attributes>70;10;10;10</additional_attributes></element><element><id>Text</id><coordinates><x>378</x><y>203</y><w>77</w><h>56</h></coordinates><panel_attributes>

_hasCart_



/// DO NOT EDIT THE CODE BELOW
customelement=
//arithmetical skills
drawLine(width/2,0,width,height/2)
drawLine(width,height/2,width/2,height)
drawLine(width/2,height,0,height/2)
drawLine(0,height/2,width/2,0)
halign=center
valign=center

lw=1
</panel_attributes><additional_attributes></additional_attributes></element><element><id>Relation</id><coordinates><x>420</x><y>203</y><w>77</w><h>21</h></coordinates><panel_attributes>lt=&lt;&lt;&lt;-
lw=3</panel_attributes><additional_attributes>10;10;90;10</additional_attributes></element><element><id>Text</id><coordinates><x>630</x><y>196</y><w>77</w><h>56</h></coordinates><panel_attributes>

_UsesShipping_



/// DO NOT EDIT THE CODE BELOW
customelement=
//arithmetical skills
drawLine(width/2,0,width,height/2)
drawLine(width,height/2,width/2,height)
drawLine(width/2,height,0,height/2)
drawLine(0,height/2,width/2,0)
halign=center
valign=center

lw=1
</panel_attributes><additional_attributes></additional_attributes></element><element><id>Relation</id><coordinates><x>637</x><y>231</y><w>21</w><h>91</h></coordinates><panel_attributes>lt=&lt;&lt;&lt;-
lw=3</panel_attributes><additional_attributes>10;10;10;110</additional_attributes></element><element><id>UMLClass</id><coordinates><x>742</x><y>196</y><w>70</w><h>70</h></coordinates><panel_attributes>Shipping
--
_ShippingID_
Name
Speed
Cost
</panel_attributes><additional_attributes></additional_attributes></element><element><id>Relation</id><coordinates><x>700</x><y>217</y><w>56</w><h>21</h></coordinates><panel_attributes>lt=-</panel_attributes><additional_attributes>10;10;60;10</additional_attributes></element><element><id>Text</id><coordinates><x>448</x><y>392</y><w>70</w><h>56</h></coordinates><panel_attributes>
_HasWishList_


/// DO NOT EDIT THE CODE BELOW
customelement=
//arithmetical skills
drawLine(width/2,0,width,height/2)
drawLine(width,height/2,width/2,height)
drawLine(width/2,height,0,height/2)
drawLine(0,height/2,width/2,0)
halign=center
valign=center

lw=1
</panel_attributes><additional_attributes></additional_attributes></element><element><id>UMLClass</id><coordinates><x>581</x><y>399</y><w>70</w><h>63</h></coordinates><panel_attributes>WishList
--
_WishListID_
Name

</panel_attributes><additional_attributes></additional_attributes></element><element><id>Relation</id><coordinates><x>511</x><y>413</y><w>84</w><h>28</h></coordinates><panel_attributes>lt=&lt;&lt;&lt;-
lw=3</panel_attributes><additional_attributes>10;10;100;20</additional_attributes></element><element><id>Relation</id><coordinates><x>406</x><y>357</y><w>70</w><h>63</h></coordinates><panel_attributes>lt=-</panel_attributes><additional_attributes>10;10;80;70</additional_attributes></element><element><id>Text</id><coordinates><x>686</x><y>392</y><w>91</w><h>70</h></coordinates><panel_attributes>_Contains_
Quantity
Note

/// DO NOT EDIT THE CODE BELOW
customelement=
//arithmetical skills
drawLine(width/2,0,width,height/2)
drawLine(width,height/2,width/2,height)
drawLine(width/2,height,0,height/2)
drawLine(0,height/2,width/2,0)
halign=center
valign=center

lw=1
</panel_attributes><additional_attributes></additional_attributes></element><element><id>Relation</id><coordinates><x>644</x><y>420</y><w>56</w><h>21</h></coordinates><panel_attributes>lt=-</panel_attributes><additional_attributes>60;10;10;10</additional_attributes></element><element><id>Relation</id><coordinates><x>532</x><y>448</y><w>203</w><h>56</h></coordinates><panel_attributes>lt=-</panel_attributes><additional_attributes>10;60;270;10</additional_attributes></element><element><id>Relation</id><coordinates><x>231</x><y>574</y><w>49</w><h>63</h></coordinates><panel_attributes>lt=&lt;&lt;&lt;-
lw=3</panel_attributes><additional_attributes>10;70;50;10</additional_attributes></element><element><id>Relation</id><coordinates><x>378</x><y>238</y><w>28</w><h>70</h></coordinates><panel_attributes>lt=&lt;&lt;&lt;-
lw=3</panel_attributes><additional_attributes>20;10;10;80</additional_attributes></element><element><id>Relation</id><coordinates><x>525</x><y>336</y><w>70</w><h>21</h></coordinates><panel_attributes>lt=&lt;&lt;&lt;-
lw=3</panel_attributes><additional_attributes>10;10;80;10</additional_attributes></element><element><id>UMLNote</id><coordinates><x>623</x><y>532</y><w>98</w><h>49</h></coordinates><panel_attributes>Sydney and Tyler</panel_attributes><additional_attributes></additional_attributes></element><element><id>Text</id><coordinates><x>252</x><y>378</y><w>84</w><h>56</h></coordinates><panel_attributes>_ForwardBy_

/// DO NOT EDIT THE CODE BELOW
customelement=
//arithmetical skills
drawLine(width/2,0,width,height/2)
drawLine(width,height/2,width/2,height)
drawLine(width/2,height,0,height/2)
drawLine(0,height/2,width/2,0)
halign=center
valign=center

lw=1
</panel_attributes><additional_attributes></additional_attributes></element><element><id>Relation</id><coordinates><x>252</x><y>343</y><w>35</w><h>63</h></coordinates><panel_attributes>lt=-</panel_attributes><additional_attributes>30;70;10;10</additional_attributes></element><element><id>Relation</id><coordinates><x>308</x><y>413</y><w>42</w><h>56</h></coordinates><panel_attributes>lt=&lt;&lt;&lt;-</panel_attributes><additional_attributes>10;10;40;60</additional_attributes></element></diagram>