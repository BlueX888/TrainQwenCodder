class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.player = null;
    this.keys = {};
    this.speed = 300; // 像素/秒
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 使用 Graphics 绘制方块纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0x00ff00, 1); // 绿色方块
    graphics.fillRect(0, 0, 50, 50);
    graphics.generateTexture('playerBox', 50, 50);
    graphics.destroy();

    // 创建玩家方块（居中位置）
    this.player = this.add.sprite(400, 300, 'playerBox');

    // 设置 WASD 键盘输入
    this.keys.W = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
    this.keys.A = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
    this.keys.S = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
    this.keys.D = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);

    // 添加提示文本
    this.add.text(10, 10, 'Use WASD to move the square', {
      fontSize: '18px',
      color: '#ffffff'
    });
  }

  update(time, delta) {
    // 计算移动向量
    let velocityX = 0;
    let velocityY = 0;

    // 检测按键状态并设置移动方向
    if (this.keys.W.isDown) {
      velocityY = -1; // 向上
    } else if (this.keys.S.isDown) {
      velocityY = 1; // 向下
    }

    if (this.keys.A.isDown) {
      velocityX = -1; // 向左
    } else if (this.keys.D.isDown) {
      velocityX = 1; // 向右
    }

    // 归一化对角线移动速度（避免斜向移动过快）
    if (velocityX !== 0 && velocityY !== 0) {
      const length = Math.sqrt(velocityX * velocityX + velocityY * velocityY);
      velocityX /= length;
      velocityY /= length;
    }

    // 根据 delta 时间更新位置（确保帧率独立）
    this.player.x += velocityX * this.speed * (delta / 1000);
    this.player.y += velocityY * this.speed * (delta / 1000);

    // 限制方块在画布范围内
    this.player.x = Phaser.Math.Clamp(this.player.x, 25, 775);
    this.player.y = Phaser.Math.Clamp(this.player.y, 25, 575);
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

// 启动游戏
new Phaser.Game(config);