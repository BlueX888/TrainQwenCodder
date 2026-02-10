class CheckerboardScene extends Phaser.Scene {
  constructor() {
    super('CheckerboardScene');
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    const tileSize = 30; // 每个格子的像素大小
    const gridSize = 20; // 20x20 网格
    
    // 创建两种红色纹理
    this.createTileTextures(tileSize);
    
    // 生成 20x20 的棋盘格地图
    const checkerboardData = this.generateCheckerboardData(gridSize);
    
    // 渲染棋盘格
    this.renderCheckerboard(checkerboardData, tileSize);
    
    // 添加边框以便更清晰地看到棋盘
    this.drawBorder(gridSize, tileSize);
    
    // 输出验证信号
    this.outputSignals(gridSize, checkerboardData);
    
    // 添加文本提示
    this.add.text(10, 10, '20x20 红色棋盘格地图', {
      fontSize: '16px',
      color: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 5, y: 5 }
    }).setDepth(1000);
  }

  /**
   * 创建两种红色系纹理
   */
  createTileTextures(size) {
    // 深红色纹理
    const darkRedGraphics = this.add.graphics();
    darkRedGraphics.fillStyle(0xcc0000, 1); // 深红色
    darkRedGraphics.fillRect(0, 0, size, size);
    darkRedGraphics.generateTexture('tile_dark_red', size, size);
    darkRedGraphics.destroy();
    
    // 浅红色纹理
    const lightRedGraphics = this.add.graphics();
    lightRedGraphics.fillStyle(0xff6666, 1); // 浅红色
    lightRedGraphics.fillRect(0, 0, size, size);
    lightRedGraphics.generateTexture('tile_light_red', size, size);
    lightRedGraphics.destroy();
  }

  /**
   * 生成 20x20 棋盘格数据
   * 返回二维数组，0 表示深红色，1 表示浅红色
   */
  generateCheckerboardData(gridSize) {
    const data = [];
    for (let row = 0; row < gridSize; row++) {
      const rowData = [];
      for (let col = 0; col < gridSize; col++) {
        // 棋盘格规则：(row + col) % 2 决定颜色
        rowData.push((row + col) % 2);
      }
      data.push(rowData);
    }
    return data;
  }

  /**
   * 渲染棋盘格
   */
  renderCheckerboard(data, tileSize) {
    const offsetX = 100; // 左边距
    const offsetY = 80;  // 上边距
    
    for (let row = 0; row < data.length; row++) {
      for (let col = 0; col < data[row].length; col++) {
        const x = offsetX + col * tileSize;
        const y = offsetY + row * tileSize;
        const tileType = data[row][col];
        
        // 根据数据选择纹理
        const texture = tileType === 0 ? 'tile_dark_red' : 'tile_light_red';
        
        // 创建图块
        const tile = this.add.image(x, y, texture);
        tile.setOrigin(0, 0);
        tile.setData('row', row);
        tile.setData('col', col);
        tile.setData('type', tileType);
      }
    }
  }

  /**
   * 绘制边框
   */
  drawBorder(gridSize, tileSize) {
    const offsetX = 100;
    const offsetY = 80;
    const width = gridSize * tileSize;
    const height = gridSize * tileSize;
    
    const border = this.add.graphics();
    border.lineStyle(2, 0xffffff, 1);
    border.strokeRect(offsetX - 2, offsetY - 2, width + 4, height + 4);
  }

  /**
   * 输出验证信号
   */
  outputSignals(gridSize, data) {
    // 统计图块数量
    let darkRedCount = 0;
    let lightRedCount = 0;
    
    for (let row = 0; row < data.length; row++) {
      for (let col = 0; col < data[row].length; col++) {
        if (data[row][col] === 0) {
          darkRedCount++;
        } else {
          lightRedCount++;
        }
      }
    }
    
    // 输出到全局信号对象
    window.__signals__ = {
      gridSize: gridSize,
      totalTiles: gridSize * gridSize,
      darkRedTiles: darkRedCount,
      lightRedTiles: lightRedCount,
      mapData: data,
      timestamp: Date.now(),
      status: 'completed'
    };
    
    // 控制台输出 JSON 格式
    console.log('=== Checkerboard Map Signals ===');
    console.log(JSON.stringify(window.__signals__, null, 2));
  }
}

// Phaser 游戏配置
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 800,
  backgroundColor: '#2d2d2d',
  scene: CheckerboardScene,
  parent: 'game-container'
};

// 启动游戏
const game = new Phaser.Game(config);