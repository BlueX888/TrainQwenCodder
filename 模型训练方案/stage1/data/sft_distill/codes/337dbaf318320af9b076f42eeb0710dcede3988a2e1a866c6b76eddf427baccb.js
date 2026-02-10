class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.player = null;
    this.keys = null;
    this.speed = 160;
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 使用 Graphics 绘制菱形
    const graphics = this.add.graphics();
    graphics.fillStyle(0x00ff00, 1);
    
    // 绘制菱形路径（中心点为 16,16，边长约 32）
    const path = new Phaser.Geom.Polygon([
      16, 0,    // 上顶点
      32, 16,   // 右顶点
      16, 32,   // 下顶点
      0, 16     // 左顶点
    ]);
    graphics.fillPoints(path.points, true);
    
    // 生成纹理
    graphics.generateTexture('diamond', 32, 32);
    graphics.destroy();
    
    // 创建玩家精灵并启用物理引擎
    this.player = this.physics.add.sprite(400, 300, 'diamond');
    this.player.setCollideWorldBounds(true);
    
    // 设置 WASD 键盘输入
    this.keys = this.input.keyboard.addKeys({
      w: Phaser.Input.Keyboard.KeyCodes.W,
      a: Phaser.Input.Keyboard.KeyCodes.A,
      s: Phaser.Input.Keyboard.KeyCodes.S,
      d: Phaser.Input.Keyboard.KeyCodes.D
    });
  }

  update(time, delta) {
    // 重置速度
    let velocityX = 0;
    let velocityY = 0;
    
    // 检测按键并设置速度
    if (this.keys.w.isDown) {
      velocityY = -this.speed;
    } else if (this.keys.s.isDown) {
      velocityY = this.speed;
    }
    
    if (this.keys.a.isDown) {
      velocityX = -this.speed;
    } else if (this.keys.d.isDown) {
      velocityX = this.speed;
    }
    
    // 对角线移动时归一化速度，保持恒定速度
    if (velocityX !== 0 && velocityY !== 0) {
      const factor = Math.sqrt(2) / 2; // 约 0.707
      velocityX *= factor;
      velocityY *= factor;
    }
    
    // 应用速度
    this.player.setVelocity(velocityX, velocityY);
  }
}

// 游戏配置
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 },
      debug: false
    }
  },
  scene: GameScene
};

// 创建游戏实例
new Phaser.Game(config);