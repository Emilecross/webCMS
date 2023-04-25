import { Accordion, AccordionDetails, AccordionSummary, Typography } from '@mui/material';
import {ExpandMore} from '@mui/icons-material';

export type reportObject = {
    reporter_id: number,
    reportee_id: number,
    report_id: number,
    reason: string
};

const ReportItem = (report: reportObject) => {
    return (
        <div >
          <Accordion sx={{my:2}}>
            <AccordionSummary
              expandIcon={<ExpandMore />}
              aria-controls="panel1a-content"
              id="panel1a-header"
            >
              <Typography>{`Report #${report.report_id} from ${report.reporter_id}`}</Typography>
            </AccordionSummary>
            <AccordionDetails>
                <Typography variant="body1">
                    Due to: {report.reason}
                </Typography>
            </AccordionDetails>
          </Accordion>
        </div>
      );
}

export default ReportItem;