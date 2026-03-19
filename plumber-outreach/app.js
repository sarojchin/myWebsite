// PlumbReach - Plumber Client Outreach Tool
const App = {
    data: {
        clients: [],
        leads: [],
        campaigns: [],
        templates: [],
        settings: { businessName: '', phone: '', email: '', checkupInterval: 6 },
        activity: []
    },

    init() {
        this.loadData();
        this.seedDefaults();
        this.bindNav();
        this.render();
    },

    // ---- Persistence ----
    loadData() {
        const saved = localStorage.getItem('plumbreach_data');
        if (saved) this.data = JSON.parse(saved);
    },

    save() {
        localStorage.setItem('plumbreach_data', JSON.stringify(this.data));
    },

    // ---- Seed default templates & demo data on first run ----
    seedDefaults() {
        if (this.data.templates.length > 0) return;

        this.data.templates = [
            {
                id: this.uid(), name: '6-Month Checkup Reminder', type: 'checkup',
                subject: 'Time for Your Plumbing Checkup!',
                body: 'Hi {name},\n\nIt\'s been {months} months since your last plumbing service. Regular checkups help prevent costly emergencies like burst pipes and water damage.\n\nWe\'d love to schedule a quick inspection at your convenience. As a valued customer, enjoy 10% off your next checkup!\n\nCall us at {business_phone} or reply to this message to book.\n\nBest,\n{business_name}'
            },
            {
                id: this.uid(), name: 'New Lead Introduction', type: 'lead',
                subject: 'Keep Your Home\'s Plumbing in Top Shape',
                body: 'Hi {name},\n\nI\'m reaching out from {business_name}. We specialize in residential plumbing maintenance and emergency repairs in your area.\n\nHere\'s what sets us apart:\n- Free initial inspection\n- 24/7 emergency service\n- Transparent pricing, no hidden fees\n\nWould you be interested in a free plumbing health check? Call us at {business_phone}.\n\nBest regards,\n{business_name}'
            },
            {
                id: this.uid(), name: 'Seasonal Maintenance Alert', type: 'seasonal',
                subject: 'Prepare Your Plumbing for {season}!',
                body: 'Hi {name},\n\n{season} is around the corner and your plumbing needs attention! Common issues this time of year include:\n\n- Frozen pipe prevention\n- Water heater maintenance\n- Drain cleaning before heavy use\n\nBook a seasonal tune-up today and save 15%!\n\nCall {business_phone} to schedule.\n\n{business_name}'
            },
            {
                id: this.uid(), name: 'Follow-Up After Service', type: 'followup',
                subject: 'How Was Your Recent Service?',
                body: 'Hi {name},\n\nThank you for choosing {business_name}! We hope everything is working perfectly after your recent service.\n\nIf you have any questions or concerns, don\'t hesitate to reach out. We\'re always here to help.\n\nWe\'d also appreciate a quick review if you have a moment - it helps other homeowners find reliable plumbing service.\n\nThank you!\n{business_name}\n{business_phone}'
            }
        ];

        this.data.campaigns = [
            {
                id: this.uid(), name: '6-Month Checkup Reminders', type: 'checkup',
                templateId: this.data.templates[0].id,
                active: true, audience: 'clients', sent: 24, opened: 18, converted: 6,
                schedule: 'Auto - when checkup due'
            },
            {
                id: this.uid(), name: 'New Homeowner Outreach', type: 'lead',
                templateId: this.data.templates[1].id,
                active: true, audience: 'leads', sent: 45, opened: 28, converted: 8,
                schedule: 'Weekly on Monday'
            },
            {
                id: this.uid(), name: 'Winter Prep Campaign', type: 'seasonal',
                templateId: this.data.templates[2].id,
                active: false, audience: 'all', sent: 60, opened: 42, converted: 15,
                schedule: 'Oct 15 - Nov 30'
            }
        ];

        // Demo clients
        const demoClients = [
            { name: 'Sarah Johnson', phone: '(555) 234-5678', email: 'sarah.j@email.com', address: '142 Oak Lane', lastService: '2025-09-15', serviceType: 'Full Inspection', notes: 'Older home, watch for galvanized pipes' },
            { name: 'Mike Chen', phone: '(555) 345-6789', email: 'mike.chen@email.com', address: '88 Maple Dr', lastService: '2025-11-20', serviceType: 'Water Heater Repair', notes: 'Tankless water heater installed 2023' },
            { name: 'Lisa Rodriguez', phone: '(555) 456-7890', email: 'lisa.r@email.com', address: '305 Elm Street', lastService: '2025-07-10', serviceType: 'Drain Cleaning', notes: 'Recurring kitchen drain issue' },
            { name: 'Tom Williams', phone: '(555) 567-8901', email: 'tom.w@email.com', address: '22 Pine Ave', lastService: '2026-01-05', serviceType: 'Pipe Repair', notes: 'Basement pipe replacement done' },
            { name: 'Jennifer Park', phone: '(555) 678-9012', email: 'jen.park@email.com', address: '410 Cedar Blvd', lastService: '2025-06-22', serviceType: 'Full Inspection', notes: 'Annual contract customer' },
        ];

        demoClients.forEach(c => {
            this.data.clients.push({
                id: this.uid(), ...c,
                nextCheckup: this.addMonths(c.lastService, 6),
                contacted: []
            });
        });

        // Demo leads
        const demoLeads = [
            { name: 'David Brown', phone: '(555) 111-2233', email: 'dbrown@email.com', source: 'Google Ads', stage: 'new', notes: 'New construction home' },
            { name: 'Amy Foster', phone: '(555) 222-3344', email: 'afoster@email.com', source: 'Referral', stage: 'contacted', notes: 'Referred by Sarah Johnson' },
            { name: 'Carlos Mendez', phone: '(555) 333-4455', email: 'cmendez@email.com', source: 'Website', stage: 'interested', notes: 'Wants quote for bathroom remodel' },
            { name: 'Rachel Kim', phone: '(555) 444-5566', email: 'rkim@email.com', source: 'Door Flyer', stage: 'new', notes: 'Older neighborhood, likely needs inspection' },
            { name: 'James Wilson', phone: '(555) 555-6677', email: 'jwilson@email.com', source: 'Nextdoor', stage: 'contacted', notes: 'Asked about pricing' },
        ];

        demoLeads.forEach(l => {
            this.data.leads.push({ id: this.uid(), ...l, createdAt: new Date().toISOString() });
        });

        this.data.activity = [
            { text: 'Checkup reminder sent to Sarah Johnson', time: new Date(Date.now() - 3600000).toISOString() },
            { text: 'New lead added: David Brown (Google Ads)', time: new Date(Date.now() - 7200000).toISOString() },
            { text: 'Amy Foster moved to Contacted', time: new Date(Date.now() - 86400000).toISOString() },
            { text: 'Winter Prep Campaign paused', time: new Date(Date.now() - 172800000).toISOString() },
        ];

        this.save();
    },

    // ---- Navigation ----
    bindNav() {
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const page = link.dataset.page;
                document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
                link.classList.add('active');
                document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
                document.getElementById('page-' + page).classList.add('active');
                this.render();
            });
        });
    },

    // ---- Render all sections ----
    render() {
        this.renderDashboard();
        this.renderClients();
        this.renderLeads();
        this.renderCampaigns();
        this.renderTemplates();
        this.renderSettings();
    },

    renderDashboard() {
        const now = new Date();
        const dueClients = this.data.clients.filter(c => new Date(c.nextCheckup) <= now);
        const overdue = this.data.clients.filter(c => new Date(c.nextCheckup) < new Date(now - 30*86400000));

        document.getElementById('stat-clients').textContent = this.data.clients.length;
        document.getElementById('stat-leads').textContent = this.data.leads.filter(l => l.stage !== 'converted').length;
        document.getElementById('stat-due').textContent = dueClients.length;
        document.getElementById('stat-campaigns').textContent = this.data.campaigns.filter(c => c.active).length;

        // Upcoming reminders
        const remindersEl = document.getElementById('upcoming-reminders');
        const upcoming = [...this.data.clients]
            .sort((a, b) => new Date(a.nextCheckup) - new Date(b.nextCheckup))
            .slice(0, 5);

        if (upcoming.length === 0) {
            remindersEl.innerHTML = '<div class="empty-state">No clients yet</div>';
        } else {
            remindersEl.innerHTML = upcoming.map(c => {
                const due = new Date(c.nextCheckup);
                const isPast = due <= now;
                return `<div class="reminder-item">
                    <div class="reminder-info">
                        <strong>${c.name}</strong>
                        <span>${c.address || c.email}</span>
                    </div>
                    <span class="badge ${isPast ? 'badge-danger' : 'badge-info'}">${isPast ? 'Overdue' : this.formatDate(c.nextCheckup)}</span>
                </div>`;
            }).join('');
        }

        // Recent activity
        const activityEl = document.getElementById('recent-activity');
        if (this.data.activity.length === 0) {
            activityEl.innerHTML = '<div class="empty-state">No activity yet</div>';
        } else {
            activityEl.innerHTML = this.data.activity.slice(0, 6).map(a =>
                `<div class="activity-item">
                    <span>${a.text}</span>
                    <span class="activity-time">${this.timeAgo(a.time)}</span>
                </div>`
            ).join('');
        }
    },

    renderClients() {
        this.filterClients();
    },

    filterClients() {
        const search = (document.getElementById('client-search').value || '').toLowerCase();
        const filter = document.getElementById('client-filter').value;
        const now = new Date();

        let clients = [...this.data.clients];

        if (search) {
            clients = clients.filter(c =>
                c.name.toLowerCase().includes(search) ||
                c.email.toLowerCase().includes(search) ||
                (c.phone || '').includes(search)
            );
        }

        if (filter === 'due') {
            clients = clients.filter(c => {
                const d = new Date(c.nextCheckup);
                return d <= new Date(now.getTime() + 14*86400000) && d >= now;
            });
        } else if (filter === 'overdue') {
            clients = clients.filter(c => new Date(c.nextCheckup) < now);
        } else if (filter === 'recent') {
            clients = clients.filter(c => c.contacted && c.contacted.length > 0);
            clients.sort((a, b) => new Date(b.contacted[b.contacted.length-1]) - new Date(a.contacted[a.contacted.length-1]));
        }

        const tbody = document.getElementById('clients-tbody');
        if (clients.length === 0) {
            tbody.innerHTML = '<tr><td colspan="7" class="empty-state">No clients found</td></tr>';
            return;
        }

        tbody.innerHTML = clients.map(c => {
            const due = new Date(c.nextCheckup);
            const isPast = due < now;
            const isSoon = due <= new Date(now.getTime() + 14*86400000) && !isPast;
            const statusClass = isPast ? 'badge-danger' : isSoon ? 'badge-warning' : 'badge-success';
            const statusText = isPast ? 'Overdue' : isSoon ? 'Due Soon' : 'Up to Date';

            return `<tr>
                <td><strong>${c.name}</strong><br><small style="color:var(--text-light)">${c.address || ''}</small></td>
                <td>${c.phone}</td>
                <td>${c.email}</td>
                <td>${this.formatDate(c.lastService)}<br><small style="color:var(--text-light)">${c.serviceType || ''}</small></td>
                <td>${this.formatDate(c.nextCheckup)}</td>
                <td><span class="badge ${statusClass}">${statusText}</span></td>
                <td>
                    <button class="btn btn-sm btn-primary" onclick="App.sendReminder('${c.id}')">Send Reminder</button>
                    <button class="btn btn-sm btn-outline" onclick="App.showModal('client','${c.id}')">Edit</button>
                    <button class="btn btn-sm btn-danger" onclick="App.deleteClient('${c.id}')">Del</button>
                </td>
            </tr>`;
        }).join('');
    },

    renderLeads() {
        const stages = ['new', 'contacted', 'interested', 'converted'];
        stages.forEach(stage => {
            const col = document.querySelector(`#pipeline-${stage} .pipeline-cards`);
            const leads = this.data.leads.filter(l => l.stage === stage);

            if (leads.length === 0) {
                col.innerHTML = '<div class="empty-state">No leads</div>';
                return;
            }

            col.innerHTML = leads.map(l => {
                const nextStage = stages[stages.indexOf(stage) + 1];
                const prevStage = stages[stages.indexOf(stage) - 1];
                return `<div class="lead-card">
                    <h4>${l.name}</h4>
                    <p>${l.source || 'Direct'}</p>
                    <p>${l.phone}</p>
                    <p style="font-size:0.75rem;color:var(--text-light);margin-top:4px">${l.notes || ''}</p>
                    <div class="lead-actions">
                        ${prevStage ? `<button class="btn btn-sm btn-outline" onclick="App.moveLead('${l.id}','${prevStage}')">&#8592;</button>` : ''}
                        ${nextStage ? `<button class="btn btn-sm btn-primary" onclick="App.moveLead('${l.id}','${nextStage}')">${nextStage === 'converted' ? 'Convert' : 'Advance'} &#8594;</button>` : ''}
                        <button class="btn btn-sm btn-outline" onclick="App.showModal('lead','${l.id}')">Edit</button>
                        <button class="btn btn-sm btn-danger" onclick="App.deleteLead('${l.id}')">Del</button>
                    </div>
                </div>`;
            }).join('');
        });
    },

    renderCampaigns() {
        const el = document.getElementById('campaigns-list');
        if (this.data.campaigns.length === 0) {
            el.innerHTML = '<div class="empty-state">No campaigns yet. Create one to start reaching out!</div>';
            return;
        }

        el.innerHTML = this.data.campaigns.map(c => `
            <div class="campaign-card">
                <div class="campaign-info">
                    <h3>${c.name}</h3>
                    <p>Audience: ${c.audience} &bull; Schedule: ${c.schedule}</p>
                </div>
                <div class="campaign-meta">
                    <div class="campaign-stat"><strong>${c.sent}</strong><small>Sent</small></div>
                    <div class="campaign-stat"><strong>${c.opened}</strong><small>Opened</small></div>
                    <div class="campaign-stat"><strong>${c.converted}</strong><small>Booked</small></div>
                    <label class="toggle">
                        <input type="checkbox" ${c.active ? 'checked' : ''} onchange="App.toggleCampaign('${c.id}')">
                        <span class="toggle-slider"></span>
                    </label>
                    <button class="btn btn-sm btn-outline" onclick="App.showModal('campaign','${c.id}')">Edit</button>
                    <button class="btn btn-sm btn-danger" onclick="App.deleteCampaign('${c.id}')">Del</button>
                </div>
            </div>
        `).join('');
    },

    renderTemplates() {
        const el = document.getElementById('templates-list');
        if (this.data.templates.length === 0) {
            el.innerHTML = '<div class="empty-state">No templates yet</div>';
            return;
        }

        const typeLabels = { checkup: 'Checkup Reminder', lead: 'Lead Outreach', seasonal: 'Seasonal', followup: 'Follow-Up' };

        el.innerHTML = this.data.templates.map(t => `
            <div class="template-card">
                <h3>${t.name}</h3>
                <div class="template-type">${typeLabels[t.type] || t.type}</div>
                <div class="template-preview">${t.body}</div>
                <div class="template-actions">
                    <button class="btn btn-sm btn-outline" onclick="App.showModal('template','${t.id}')">Edit</button>
                    <button class="btn btn-sm btn-danger" onclick="App.deleteTemplate('${t.id}')">Delete</button>
                </div>
            </div>
        `).join('');
    },

    renderSettings() {
        const s = this.data.settings;
        document.getElementById('set-business-name').value = s.businessName || '';
        document.getElementById('set-phone').value = s.phone || '';
        document.getElementById('set-email').value = s.email || '';
        document.getElementById('set-interval').value = s.checkupInterval || 6;
    },

    saveSettings() {
        this.data.settings.businessName = document.getElementById('set-business-name').value;
        this.data.settings.phone = document.getElementById('set-phone').value;
        this.data.settings.email = document.getElementById('set-email').value;
        this.data.settings.checkupInterval = parseInt(document.getElementById('set-interval').value) || 6;
        this.save();
        alert('Settings saved!');
    },

    // ---- Actions ----
    sendReminder(clientId) {
        const client = this.data.clients.find(c => c.id === clientId);
        if (!client) return;

        const template = this.data.templates.find(t => t.type === 'checkup');
        let message = template ? template.body : 'Hi {name}, it\'s time for your plumbing checkup!';
        message = message.replace(/\{name\}/g, client.name.split(' ')[0])
            .replace(/\{business_name\}/g, this.data.settings.businessName || 'Your Plumber')
            .replace(/\{business_phone\}/g, this.data.settings.phone || '(555) 000-0000')
            .replace(/\{months\}/g, this.data.settings.checkupInterval || 6);

        client.contacted = client.contacted || [];
        client.contacted.push(new Date().toISOString());

        this.logActivity(`Checkup reminder sent to ${client.name}`);
        this.save();
        this.render();
        alert(`Reminder sent to ${client.name}!\n\nPreview:\n${message}`);
    },

    moveLead(leadId, newStage) {
        const lead = this.data.leads.find(l => l.id === leadId);
        if (!lead) return;
        lead.stage = newStage;

        if (newStage === 'converted') {
            // Convert lead to client
            this.data.clients.push({
                id: this.uid(),
                name: lead.name,
                phone: lead.phone,
                email: lead.email,
                address: '',
                lastService: new Date().toISOString().slice(0, 10),
                serviceType: 'Initial Inspection',
                nextCheckup: this.addMonths(new Date().toISOString().slice(0, 10), this.data.settings.checkupInterval || 6),
                notes: lead.notes,
                contacted: []
            });
            this.logActivity(`Lead converted to client: ${lead.name}`);
        } else {
            this.logActivity(`${lead.name} moved to ${newStage}`);
        }

        this.save();
        this.render();
    },

    toggleCampaign(campId) {
        const c = this.data.campaigns.find(x => x.id === campId);
        if (!c) return;
        c.active = !c.active;
        this.logActivity(`Campaign "${c.name}" ${c.active ? 'activated' : 'paused'}`);
        this.save();
        this.render();
    },

    deleteClient(id) {
        if (!confirm('Delete this client?')) return;
        this.data.clients = this.data.clients.filter(c => c.id !== id);
        this.save(); this.render();
    },

    deleteLead(id) {
        if (!confirm('Delete this lead?')) return;
        this.data.leads = this.data.leads.filter(l => l.id !== id);
        this.save(); this.render();
    },

    deleteCampaign(id) {
        if (!confirm('Delete this campaign?')) return;
        this.data.campaigns = this.data.campaigns.filter(c => c.id !== id);
        this.save(); this.render();
    },

    deleteTemplate(id) {
        if (!confirm('Delete this template?')) return;
        this.data.templates = this.data.templates.filter(t => t.id !== id);
        this.save(); this.render();
    },

    // ---- Modals ----
    showModal(type, editId) {
        const overlay = document.getElementById('modal-overlay');
        const title = document.getElementById('modal-title');
        const body = document.getElementById('modal-body');

        overlay.classList.add('active');

        if (type === 'client') {
            const c = editId ? this.data.clients.find(x => x.id === editId) : null;
            title.textContent = c ? 'Edit Client' : 'Add Client';
            body.innerHTML = `
                <div class="form-group"><label>Full Name</label><input type="text" id="m-name" value="${c ? c.name : ''}"></div>
                <div class="form-group"><label>Phone</label><input type="tel" id="m-phone" value="${c ? c.phone : ''}"></div>
                <div class="form-group"><label>Email</label><input type="email" id="m-email" value="${c ? c.email : ''}"></div>
                <div class="form-group"><label>Address</label><input type="text" id="m-address" value="${c ? c.address || '' : ''}"></div>
                <div class="form-group"><label>Last Service Date</label><input type="date" id="m-lastservice" value="${c ? c.lastService : new Date().toISOString().slice(0, 10)}"></div>
                <div class="form-group"><label>Service Type</label><input type="text" id="m-servicetype" value="${c ? c.serviceType || '' : ''}" placeholder="e.g. Full Inspection"></div>
                <div class="form-group"><label>Notes</label><textarea id="m-notes">${c ? c.notes || '' : ''}</textarea></div>
                <button class="btn btn-primary" onclick="App.saveClient('${editId || ''}')">Save Client</button>
            `;
        } else if (type === 'lead') {
            const l = editId ? this.data.leads.find(x => x.id === editId) : null;
            title.textContent = l ? 'Edit Lead' : 'Add Lead';
            body.innerHTML = `
                <div class="form-group"><label>Full Name</label><input type="text" id="m-name" value="${l ? l.name : ''}"></div>
                <div class="form-group"><label>Phone</label><input type="tel" id="m-phone" value="${l ? l.phone : ''}"></div>
                <div class="form-group"><label>Email</label><input type="email" id="m-email" value="${l ? l.email : ''}"></div>
                <div class="form-group"><label>Source</label>
                    <select id="m-source">
                        <option ${l && l.source === 'Google Ads' ? 'selected' : ''}>Google Ads</option>
                        <option ${l && l.source === 'Referral' ? 'selected' : ''}>Referral</option>
                        <option ${l && l.source === 'Website' ? 'selected' : ''}>Website</option>
                        <option ${l && l.source === 'Door Flyer' ? 'selected' : ''}>Door Flyer</option>
                        <option ${l && l.source === 'Nextdoor' ? 'selected' : ''}>Nextdoor</option>
                        <option ${l && l.source === 'Facebook' ? 'selected' : ''}>Facebook</option>
                        <option ${l && l.source === 'Other' ? 'selected' : ''}>Other</option>
                    </select>
                </div>
                <div class="form-group"><label>Notes</label><textarea id="m-notes">${l ? l.notes || '' : ''}</textarea></div>
                <button class="btn btn-primary" onclick="App.saveLead('${editId || ''}')">Save Lead</button>
            `;
        } else if (type === 'campaign') {
            const c = editId ? this.data.campaigns.find(x => x.id === editId) : null;
            title.textContent = c ? 'Edit Campaign' : 'New Campaign';
            const templateOpts = this.data.templates.map(t =>
                `<option value="${t.id}" ${c && c.templateId === t.id ? 'selected' : ''}>${t.name}</option>`
            ).join('');
            body.innerHTML = `
                <div class="form-group"><label>Campaign Name</label><input type="text" id="m-name" value="${c ? c.name : ''}"></div>
                <div class="form-group"><label>Template</label><select id="m-template">${templateOpts}</select></div>
                <div class="form-group"><label>Audience</label>
                    <select id="m-audience">
                        <option value="clients" ${c && c.audience === 'clients' ? 'selected' : ''}>Existing Clients</option>
                        <option value="leads" ${c && c.audience === 'leads' ? 'selected' : ''}>Leads Only</option>
                        <option value="all" ${c && c.audience === 'all' ? 'selected' : ''}>All Contacts</option>
                    </select>
                </div>
                <div class="form-group"><label>Schedule</label><input type="text" id="m-schedule" value="${c ? c.schedule : 'Auto - when checkup due'}" placeholder="e.g. Weekly on Monday"></div>
                <button class="btn btn-primary" onclick="App.saveCampaign('${editId || ''}')">Save Campaign</button>
            `;
        } else if (type === 'template') {
            const t = editId ? this.data.templates.find(x => x.id === editId) : null;
            title.textContent = t ? 'Edit Template' : 'New Template';
            body.innerHTML = `
                <div class="form-group"><label>Template Name</label><input type="text" id="m-name" value="${t ? t.name : ''}"></div>
                <div class="form-group"><label>Type</label>
                    <select id="m-type">
                        <option value="checkup" ${t && t.type === 'checkup' ? 'selected' : ''}>Checkup Reminder</option>
                        <option value="lead" ${t && t.type === 'lead' ? 'selected' : ''}>Lead Outreach</option>
                        <option value="seasonal" ${t && t.type === 'seasonal' ? 'selected' : ''}>Seasonal</option>
                        <option value="followup" ${t && t.type === 'followup' ? 'selected' : ''}>Follow-Up</option>
                    </select>
                </div>
                <div class="form-group"><label>Subject Line</label><input type="text" id="m-subject" value="${t ? t.subject : ''}"></div>
                <div class="form-group"><label>Message Body</label><textarea id="m-body" style="min-height:160px">${t ? t.body : ''}</textarea></div>
                <p style="font-size:0.75rem;color:var(--text-light);margin-bottom:12px">Variables: {name}, {business_name}, {business_phone}, {months}, {season}</p>
                <button class="btn btn-primary" onclick="App.saveTemplate('${editId || ''}')">Save Template</button>
            `;
        }
    },

    closeModal() {
        document.getElementById('modal-overlay').classList.remove('active');
    },

    saveClient(editId) {
        const name = document.getElementById('m-name').value.trim();
        if (!name) { alert('Name is required'); return; }

        const obj = {
            name,
            phone: document.getElementById('m-phone').value.trim(),
            email: document.getElementById('m-email').value.trim(),
            address: document.getElementById('m-address').value.trim(),
            lastService: document.getElementById('m-lastservice').value,
            serviceType: document.getElementById('m-servicetype').value.trim(),
            notes: document.getElementById('m-notes').value.trim(),
        };
        obj.nextCheckup = this.addMonths(obj.lastService, this.data.settings.checkupInterval || 6);

        if (editId) {
            const idx = this.data.clients.findIndex(c => c.id === editId);
            if (idx >= 0) Object.assign(this.data.clients[idx], obj);
        } else {
            obj.id = this.uid();
            obj.contacted = [];
            this.data.clients.push(obj);
            this.logActivity(`New client added: ${name}`);
        }

        this.save(); this.closeModal(); this.render();
    },

    saveLead(editId) {
        const name = document.getElementById('m-name').value.trim();
        if (!name) { alert('Name is required'); return; }

        const obj = {
            name,
            phone: document.getElementById('m-phone').value.trim(),
            email: document.getElementById('m-email').value.trim(),
            source: document.getElementById('m-source').value,
            notes: document.getElementById('m-notes').value.trim(),
        };

        if (editId) {
            const idx = this.data.leads.findIndex(l => l.id === editId);
            if (idx >= 0) Object.assign(this.data.leads[idx], obj);
        } else {
            obj.id = this.uid();
            obj.stage = 'new';
            obj.createdAt = new Date().toISOString();
            this.data.leads.push(obj);
            this.logActivity(`New lead added: ${name} (${obj.source})`);
        }

        this.save(); this.closeModal(); this.render();
    },

    saveCampaign(editId) {
        const name = document.getElementById('m-name').value.trim();
        if (!name) { alert('Name is required'); return; }

        const obj = {
            name,
            templateId: document.getElementById('m-template').value,
            audience: document.getElementById('m-audience').value,
            schedule: document.getElementById('m-schedule').value.trim(),
        };

        if (editId) {
            const idx = this.data.campaigns.findIndex(c => c.id === editId);
            if (idx >= 0) Object.assign(this.data.campaigns[idx], obj);
        } else {
            obj.id = this.uid();
            obj.active = true;
            obj.sent = 0; obj.opened = 0; obj.converted = 0;
            this.data.campaigns.push(obj);
            this.logActivity(`New campaign created: ${name}`);
        }

        this.save(); this.closeModal(); this.render();
    },

    saveTemplate(editId) {
        const name = document.getElementById('m-name').value.trim();
        if (!name) { alert('Name is required'); return; }

        const obj = {
            name,
            type: document.getElementById('m-type').value,
            subject: document.getElementById('m-subject').value.trim(),
            body: document.getElementById('m-body').value,
        };

        if (editId) {
            const idx = this.data.templates.findIndex(t => t.id === editId);
            if (idx >= 0) Object.assign(this.data.templates[idx], obj);
        } else {
            obj.id = this.uid();
            this.data.templates.push(obj);
        }

        this.save(); this.closeModal(); this.render();
    },

    // ---- Helpers ----
    uid() { return Math.random().toString(36).substr(2, 9); },

    addMonths(dateStr, months) {
        const d = new Date(dateStr);
        d.setMonth(d.getMonth() + months);
        return d.toISOString().slice(0, 10);
    },

    formatDate(dateStr) {
        if (!dateStr) return '-';
        return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    },

    timeAgo(isoStr) {
        const diff = Date.now() - new Date(isoStr).getTime();
        const mins = Math.floor(diff / 60000);
        if (mins < 60) return `${mins}m ago`;
        const hrs = Math.floor(mins / 60);
        if (hrs < 24) return `${hrs}h ago`;
        const days = Math.floor(hrs / 24);
        return `${days}d ago`;
    },

    logActivity(text) {
        this.data.activity.unshift({ text, time: new Date().toISOString() });
        if (this.data.activity.length > 50) this.data.activity.length = 50;
    }
};

document.addEventListener('DOMContentLoaded', () => App.init());
