class CheckerboardScene extends Phaser.Scene {
  constructor() {
    super('CheckerboardScene');
    // 状态信号变量
    this.mapWidth = 20;
    this.mapHeight = 20;
    this.tileSize = 32;
    this.totalTiles = 0;
    this.color1Count = 0;
    this.color2Count = 0;
    this.isMapGenerated = false;
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 定义两种青色
    const cyanLight = 0x00FFFF; // 亮青色
    const cyanDark = 0x008B8B;  // 暗青色

    // 创建 Graphics 对象用于绘制
    const graphics = this.add.graphics();

    // 生成 20x20 的二维数组并绘制棋盘格
    const map = [];
    
    for (let y = 0; y < this.mapHeight; y++) {
      map[y] = [];
      for (let x = 0; x < this.mapWidth; x++) {
        // 计算位置
        const posX = x * this.tileSize;
        const posY = y * this.tileSize;
        
        // 根据 (x + y) 的奇偶性决定颜色
        const isEven = (x + y) % 2 === 0;
        const color = isEven ? cyanLight : cyanDark;
        
        // 绘制方块
        graphics.fillStyle(color, 1);
        graphics.fillRect(posX, posY, this.tileSize, this.tileSize);
        
        // 添加边框使格子更清晰
        graphics.lineStyle(1, 0x000000, 0.2);
        graphics.strokeRect(posX, posY, this.tileSize, this.tileSize);
        
        // 记录到数组
        map[y][x] = isEven ? 1 : 2;
        
        // 更新统计
        this.totalTiles++;
        if (isEven) {
          this.color1Count++;
        } else {
          this.color2Count++;
        }
      }
    }

    // 更新状态
    this.isMapGenerated = true;

    // 添加信息文本显示状态
    const infoText = this.add.text(10, this.mapHeight * this.tileSize + 10, '', {
      fontSize: '16px',
      color: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    infoText.setText([
      `地图尺寸: ${this.mapWidth} x ${this.mapHeight}`,
      `总瓦片数: ${this.totalTiles}`,
      `亮青色方块: ${this.color1Count}`,
      `暗青色方块: ${this.color2Count}`,
      `生成状态: ${this.isMapGenerated ? '完成' : '未完成'}`
    ]);

    // 添加标题
    const title = this.add.text(
      (this.mapWidth * this.tileSize) / 2,
      -30,
      '青色棋盘格地图 (20x20)',
      {
        fontSize: '24px',
        color: '#00FFFF',
        fontStyle: 'bold'
      }
    );
    title.setOrigin(0.5, 0.5);

    // 将相机居中显示棋盘
    this.cameras.main.centerOn(
      (this.mapWidth * this.tileSize) / 2,
      (this.mapHeight * this.tileSize) / 2
    );

    // 在控制台输出状态信息
    console.log('=== 棋盘格地图生成完成 ===');
    console.log('地图数组:', map);
    console.log('总瓦片数:', this.totalTiles);
    console.log('亮青色方块数:', this.color1Count);
    console.log('暗青色方块数:', this.color2Count);
  }

  update(time, delta) {
    // 本示例不需要更新逻辑
  }
}

// 游戏配置
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 720,
  backgroundColor: '#2d2d2d',
  scene: CheckerboardScene,
  pixelArt: true // 保持像素清晰
};

// 创建游戏实例
const game = new Phaser.Game(config);