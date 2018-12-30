import * as React from 'react';
import { withStyles, Button } from '@material-ui/core';
// import { bookStore } from 'stores';
import { inject, observer } from 'mobx-react';

import {
    Grid, Table, TableHeaderRow, PagingPanel
} from '@devexpress/dx-react-grid-material-ui';
import {
    SortingState, Sorting, PagingState, CustomPaging,
} from '@devexpress/dx-react-grid';
import { bookStore } from 'stores';
import { PaginationParameters } from 'data';

const styles: any = (theme: any) => ({
    authorChip: {
        marginRight: theme.spacing.unit
    }
});

interface IBooksTableState {
    sorting: Sorting[],
    currentPage: number,
    pageSizes: number[],
}

@inject('bookStore')
@observer
class BooksTable extends React.Component<any, IBooksTableState> {

    constructor(props: any) {
        super(props);

        this.state = {
            sorting: [{ columnName: "Title", direction: 'desc' }],
            currentPage: 0,
            pageSizes: [5, 10, 15, 20]
        }
    }

    componentDidMount() {
        this.updateData();
    }

    componentDidUpdate() {
        this.updateData();
    }

    columns = [
        { name: 'Title', title: 'Title' },
        { name: 'PageCount', title: 'Pages' }
    ];

    changeSorting = (sorting) => {
        this.setState({
            sorting
        });
    }

    changeCurrentPage = (currentPage) => {
        this.setState({
            currentPage
        });
    }

    generatePaginationParameters() {
        const { sorting, currentPage } = this.state;
        let paginationHelper: PaginationParameters = { sort: sorting[0], currentPage: currentPage };
        return paginationHelper;
    }

    oldpaginationParams: PaginationParameters;
    updateData = () => {
        let paginationParams = this.generatePaginationParameters();
        if (JSON.stringify(paginationParams) != JSON.stringify(this.oldpaginationParams)) {
            this.oldpaginationParams = paginationParams;
            bookStore.setPaginatedBooksParameters(paginationParams);
        }
    }

    public render() {
        // const { classes } = this.props;
        const { sorting, currentPage, pageSizes } = this.state;
        const { paginatedBooks } = bookStore;
        return (
            <React.Fragment>

                <Grid columns={this.columns} rows={paginatedBooks || []}>
                    <SortingState
                        sorting={sorting}
                        onSortingChange={this.changeSorting}
                    />
                    <PagingState
                        currentPage={currentPage}
                        onCurrentPageChange={this.changeCurrentPage}
                        pageSize={pageSizes[0]}
                    // onPageSizeChange={this.changePageSize}
                    />
                    <CustomPaging
                        totalCount={2}
                    />
                    <Table />
                    <TableHeaderRow showSortingControls />
                    <PagingPanel
                        pageSizes={pageSizes}
                    />
                </Grid>
                {/* <link rel="stylesheet" href="https://fonts.googleapis.com/icon?family=Material+Icons"></link>
                <MaterialTable
                    title="Demo Title"
                    
                    options={{
                        toolbar: false
                    }}
                    columns={[
                        { title: 'Title', field: 'Title' },
                        {
                            title: 'Author(s)', field: 'Authors',
                            render: (rowData: Book) => {
                                return (
                                    <div>
                                        {rowData.Authors ?
                                            rowData.Authors.map(data => {
                                                return <Chip
                                                    key={data}
                                                    icon={<PersonIcon />}
                                                    label={data}
                                                    className={classes.authorChip}
                                                />
                                        }) : ""}
                                    </div>
                                );
                            }
                        },
                        { title: 'Publisher', field: 'Publisher' },
                        { title: 'PublishedDate', field: 'PublishedDate', type: 'date' },
                        { title: 'Pages', field: 'PageCount', type: 'numeric' },
                    ]}
                    data={filteredBooks || emptyBooks}
                /> */}
                <Button onClick={bookStore.getPreviousPaginatedBooks}>Previous</Button>
                <Button onClick={bookStore.getNextPaginatedBooks}>NEXT</Button>
            </React.Fragment>
        );
    }
}

export default withStyles(styles)(BooksTable);