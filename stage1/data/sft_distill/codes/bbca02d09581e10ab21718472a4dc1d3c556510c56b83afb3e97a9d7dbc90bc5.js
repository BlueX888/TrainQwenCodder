class CheckerboardScene extends Phaser.Scene {
  constructor() {
    super('CheckerboardScene');
    this.mapWidth = 5;
    this.mapHeight = 5;
    this.tileSize = 64;
    this.tilesGenerated = 0; // 状态信号：生成的瓦片数量
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 1. 创建两种红色系纹理
    this.createTileTextures();

    // 2. 创建5x5的二维数组数据（交替模式）
    const mapData = this.createCheckerboardData();

    // 3. 创建Tilemap
    const map = this.make.tilemap({
      data: mapData,
      tileWidth: this.tileSize,
      tileHeight: this.tileSize
    });

    // 4. 添加tileset（使用程序化生成的纹理）
    const tiles = map.addTilesetImage('tiles');

    // 5. 创建layer并渲染
    const layer = map.createLayer(0, tiles, 100, 100);

    // 更新状态信号
    this.tilesGenerated = this.mapWidth * this.mapHeight;

    // 添加调试信息显示
    this.add.text(10, 10, `Checkerboard Map`, {
      fontSize: '24px',
      color: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    this.add.text(10, 50, `Size: ${this.mapWidth}x${this.mapHeight}`, {
      fontSize: '18px',
      color: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    this.add.text(10, 80, `Tiles: ${this.tilesGenerated}`, {
      fontSize: '18px',
      color: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 添加边框以突出显示棋盘
    const borderGraphics = this.add.graphics();
    borderGraphics.lineStyle(3, 0xffffff, 1);
    borderGraphics.strokeRect(
      100 - 2,
      100 - 2,
      this.mapWidth * this.tileSize + 4,
      this.mapHeight * this.tileSize + 4
    );

    console.log('Checkerboard generated with', this.tilesGenerated, 'tiles');
  }

  createTileTextures() {
    // 创建深红色瓦片纹理（索引0）
    const darkRedGraphics = this.add.graphics();
    darkRedGraphics.fillStyle(0xcc0000, 1); // 深红色
    darkRedGraphics.fillRect(0, 0, this.tileSize, this.tileSize);
    darkRedGraphics.lineStyle(2, 0x990000, 1); // 添加边框
    darkRedGraphics.strokeRect(0, 0, this.tileSize, this.tileSize);
    darkRedGraphics.generateTexture('tile0', this.tileSize, this.tileSize);
    darkRedGraphics.destroy();

    // 创建浅红色瓦片纹理（索引1）
    const lightRedGraphics = this.add.graphics();
    lightRedGraphics.fillStyle(0xff6666, 1); // 浅红色
    lightRedGraphics.fillRect(0, 0, this.tileSize, this.tileSize);
    lightRedGraphics.lineStyle(2, 0xcc3333, 1); // 添加边框
    lightRedGraphics.strokeRect(0, 0, this.tileSize, this.tileSize);
    lightRedGraphics.generateTexture('tile1', this.tileSize, this.tileSize);
    lightRedGraphics.destroy();

    // 合并纹理到单个tileset
    const canvas = document.createElement('canvas');
    canvas.width = this.tileSize * 2;
    canvas.height = this.tileSize;
    const ctx = canvas.getContext('2d');

    // 绘制tile0
    const tile0 = this.textures.get('tile0').getSourceImage();
    ctx.drawImage(tile0, 0, 0);

    // 绘制tile1
    const tile1 = this.textures.get('tile1').getSourceImage();
    ctx.drawImage(tile1, this.tileSize, 0);

    // 创建最终的tileset纹理
    this.textures.addCanvas('tiles', canvas);
  }

  createCheckerboardData() {
    // 创建5x5的二维数组，交替填充0和1
    const data = [];
    for (let y = 0; y < this.mapHeight; y++) {
      const row = [];
      for (let x = 0; x < this.mapWidth; x++) {
        // 棋盘格模式：(x + y) % 2 决定颜色
        row.push((x + y) % 2);
      }
      data.push(row);
    }
    return data;
  }

  update(time, delta) {
    // 可以在这里添加动画或交互逻辑
  }
}

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: CheckerboardScene,
  pixelArt: true // 保持像素清晰
};

new Phaser.Game(config);