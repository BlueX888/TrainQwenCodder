class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.diamond = null;
    this.keys = null;
    this.speed = 160; // 像素/秒
  }

  preload() {
    // 无需加载外部资源
  }

  create() {
    // 使用 Graphics 绘制菱形并生成纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0x00ff00, 1);
    
    // 绘制菱形路径（中心点为 25, 25，大小为 50x50）
    const path = new Phaser.Geom.Polygon([
      25, 0,    // 上顶点
      50, 25,   // 右顶点
      25, 50,   // 下顶点
      0, 25     // 左顶点
    ]);
    
    graphics.fillPoints(path.points, true);
    
    // 生成纹理
    graphics.generateTexture('diamondTex', 50, 50);
    graphics.destroy();
    
    // 创建菱形精灵，放置在屏幕中心
    this.diamond = this.add.sprite(400, 300, 'diamondTex');
    
    // 设置键盘输入
    this.keys = this.input.keyboard.addKeys({
      w: Phaser.Input.Keyboard.KeyCodes.W,
      a: Phaser.Input.Keyboard.KeyCodes.A,
      s: Phaser.Input.Keyboard.KeyCodes.S,
      d: Phaser.Input.Keyboard.KeyCodes.D
    });
  }

  update(time, delta) {
    // 计算每帧移动距离 = 速度 * 时间间隔（转换为秒）
    const distance = this.speed * (delta / 1000);
    
    // 根据按键状态移动菱形
    if (this.keys.w.isDown) {
      this.diamond.y -= distance;
    }
    if (this.keys.s.isDown) {
      this.diamond.y += distance;
    }
    if (this.keys.a.isDown) {
      this.diamond.x -= distance;
    }
    if (this.keys.d.isDown) {
      this.diamond.x += distance;
    }
  }
}

// 游戏配置
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: GameScene
};

// 创建游戏实例
new Phaser.Game(config);