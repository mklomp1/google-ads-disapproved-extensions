/**
 * Google Ads Script to check for disapproved ad extensions at MCC level
 * Only checks accounts with the label "TB_Script"
 * Sends email report of findings
 */

function main() {
  // Configuration
  const CONFIG = {
    LABEL_NAME: 'TB_Script',
    EMAIL_RECIPIENTS: ['your-email@example.com'], // Replace with actual email
    EMAIL_SUBJECT: 'Disapproved Ad Extensions Report',
  };

  // Store results for email
  const results = [];
  
  // Get all accounts with the specified label
  const accountSelector = AdsManagerApp.accounts()
    .withCondition(`LabelNames CONTAINS '${CONFIG.LABEL_NAME}'`);
  
  // Iterator for the accounts
  const accountIterator = accountSelector.get();
  
  // Process each account
  while (accountIterator.hasNext()) {
    const account = accountIterator.next();
    AdsManagerApp.select(account);
    
    const accountFindings = processAccount(account);
    if (accountFindings.hasDisapprovedExtensions) {
      results.push(accountFindings);
    }
  }
  
  // Send email if there are any findings
  if (results.length > 0) {
    sendEmailReport(results, CONFIG);
  }
}

/**
 * Process a single account to check for disapproved extensions
 */
function processAccount(account) {
  const accountName = account.getName();
  const accountId = account.getCustomerId();
  const findings = {
    accountName: accountName,
    accountId: accountId,
    hasDisapprovedExtensions: false,
    disapprovedExtensions: []
  };
  
  // Check each type of extension
  checkSitelinkExtensions(findings);
  checkCallExtensions(findings);
  checkCalloutExtensions(findings);
  checkLocationExtensions(findings);
  checkPriceExtensions(findings);
  checkImageExtensions(findings);
  checkPromotionExtensions(findings);
  
  return findings;
}

/**
 * Check sitelink extensions for disapprovals
 */
function checkSitelinkExtensions(findings) {
  const extensionIterator = AdsApp.extensions()
    .sitelinks()
    .withCondition('Status = ENABLED')
    .withCondition('ApprovalStatus != APPROVED')
    .get();
  
  while (extensionIterator.hasNext()) {
    const extension = extensionIterator.next();
    findings.hasDisapprovedExtensions = true;
    findings.disapprovedExtensions.push({
      type: 'Sitelink',
      text: extension.getLinkText(),
      disapprovalReason: extension.getApprovalStatus()
    });
  }
}

/**
 * Check call extensions for disapprovals
 */
function checkCallExtensions(findings) {
  const extensionIterator = AdsApp.extensions()
    .phoneNumbers()
    .withCondition('Status = ENABLED')
    .withCondition('ApprovalStatus != APPROVED')
    .get();
  
  while (extensionIterator.hasNext()) {
    const extension = extensionIterator.next();
    findings.hasDisapprovedExtensions = true;
    findings.disapprovedExtensions.push({
      type: 'Call',
      text: extension.getPhoneNumber(),
      disapprovalReason: extension.getApprovalStatus()
    });
  }
}

/**
 * Check callout extensions for disapprovals
 */
function checkCalloutExtensions(findings) {
  const extensionIterator = AdsApp.extensions()
    .callouts()
    .withCondition('Status = ENABLED')
    .withCondition('ApprovalStatus != APPROVED')
    .get();
  
  while (extensionIterator.hasNext()) {
    const extension = extensionIterator.next();
    findings.hasDisapprovedExtensions = true;
    findings.disapprovedExtensions.push({
      type: 'Callout',
      text: extension.getText(),
      disapprovalReason: extension.getApprovalStatus()
    });
  }
}

/**
 * Check location extensions for disapprovals
 */
function checkLocationExtensions(findings) {
  const extensionIterator = AdsApp.extensions()
    .locations()
    .withCondition('Status = ENABLED')
    .withCondition('ApprovalStatus != APPROVED')
    .get();
  
  while (extensionIterator.hasNext()) {
    const extension = extensionIterator.next();
    findings.hasDisapprovedExtensions = true;
    findings.disapprovedExtensions.push({
      type: 'Location',
      text: extension.getAddress(),
      disapprovalReason: extension.getApprovalStatus()
    });
  }
}

/**
 * Check price extensions for disapprovals
 */
function checkPriceExtensions(findings) {
  const extensionIterator = AdsApp.extensions()
    .prices()
    .withCondition('Status = ENABLED')
    .withCondition('ApprovalStatus != APPROVED')
    .get();
  
  while (extensionIterator.hasNext()) {
    const extension = extensionIterator.next();
    findings.hasDisapprovedExtensions = true;
    findings.disapprovedExtensions.push({
      type: 'Price',
      text: extension.getHeaderText(),
      disapprovalReason: extension.getApprovalStatus()
    });
  }
}

/**
 * Check image extensions for disapprovals
 */
function checkImageExtensions(findings) {
  const extensionIterator = AdsApp.extensions()
    .images()
    .withCondition('Status = ENABLED')
    .withCondition('ApprovalStatus != APPROVED')
    .get();
  
  while (extensionIterator.hasNext()) {
    const extension = extensionIterator.next();
    findings.hasDisapprovedExtensions = true;
    findings.disapprovedExtensions.push({
      type: 'Image',
      text: extension.getName(),
      disapprovalReason: extension.getApprovalStatus()
    });
  }
}

/**
 * Check promotion extensions for disapprovals
 */
function checkPromotionExtensions(findings) {
  const extensionIterator = AdsApp.extensions()
    .promotions()
    .withCondition('Status = ENABLED')
    .withCondition('ApprovalStatus != APPROVED')
    .get();
  
  while (extensionIterator.hasNext()) {
    const extension = extensionIterator.next();
    findings.hasDisapprovedExtensions = true;
    findings.disapprovedExtensions.push({
      type: 'Promotion',
      text: extension.getPromotionText(),
      disapprovalReason: extension.getApprovalStatus()
    });
  }
}

/**
 * Send email report with findings
 */
function sendEmailReport(results, config) {
  let emailBody = 'Disapproved Ad Extensions Report\n\n';
  
  results.forEach(accountFindings => {
    emailBody += `Account: ${accountFindings.accountName} (${accountFindings.accountId})\n`;
    emailBody += '----------------------------------------\n';
    
    accountFindings.disapprovedExtensions.forEach(extension => {
      emailBody += `Type: ${extension.type}\n`;
      emailBody += `Text: ${extension.text}\n`;
      emailBody += `Disapproval Reason: ${extension.disapprovalReason}\n\n`;
    });
    
    emailBody += '\n';
  });
  
  MailApp.sendEmail({
    to: config.EMAIL_RECIPIENTS.join(','),
    subject: config.EMAIL_SUBJECT,
    body: emailBody
  });
}
