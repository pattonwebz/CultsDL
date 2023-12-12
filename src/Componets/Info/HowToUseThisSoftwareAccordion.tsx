import { Accordion, AccordionDetails, AccordionSummary, List, ListItem } from '@mui/material';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import { Typography } from '@material-ui/core';
import React from 'react';

export function HowToUseThisSoftwareAccordion () {

	return (
		<Accordion>
			<AccordionSummary
				expandIcon={<ExpandMoreIcon />}
				aria-controls="panel1a-content"
				id="panel1a-header"
			>
				<Typography>How to use this software.</Typography>
			</AccordionSummary>
			<AccordionDetails>
				{/* <Box> */}
				<Typography>
					There are some things to keep in mind when using this software.
				</Typography>
				<ol>
					<li>
						<Typography>You need to download orders before anything else.</Typography>
					</li>
					<li>
						<Typography>Then you need to fetch the files that are available for each creation. You can optionally download the extra creation data like images and descriptions.</Typography>
						<ul component="ol" sx={{ display: 'block' }}>
							<li component="li" sx={{ display: 'list-item' }}>
								<Typography>I try my best to connect files to their orders but in cases where creations are private, unlisted or removed that's not easy. To combat this you can manually connect files to creations in their orders.</Typography>
							</li>
						</ul>
					</li>
					<li>
						<Typography>Then you can download files - this can be done on the files tab on a per file bases or from the creations tab where you can get entire creations at once.</Typography>
					</li>
				</ol>
				{/* </Box> */}
			</AccordionDetails>
		</Accordion>
	);
}

export default HowToUseThisSoftwareAccordion;
