class GravityFlipScene extends Phaser.Scene {
  constructor() {
    super('GravityFlipScene');
    this.gravityDirection = 'DOWN'; // 状态信号：DOWN 或 UP
    this.flipCount = 0; // 状态信号：切换次数
  }

  preload() {
    // 使用 Graphics 生成纹理，无需外部资源
  }

  create() {
    const { width, height } = this.cameras.main;

    // 创建玩家纹理（使用 Graphics）
    const graphics = this.add.graphics();
    graphics.fillStyle(0x00ff00, 1);
    graphics.fillCircle(16, 16, 16);
    graphics.generateTexture('player', 32, 32);
    graphics.destroy();

    // 创建地面纹理
    const groundGraphics = this.add.graphics();
    groundGraphics.fillStyle(0x8b4513, 1);
    groundGraphics.fillRect(0, 0, width, 40);
    groundGraphics.generateTexture('ground', width, 40);
    groundGraphics.destroy();

    // 创建玩家精灵（初始位置在屏幕中央）
    this.player = this.physics.add.sprite(width / 2, height / 2, 'player');
    this.player.setCollideWorldBounds(true);
    this.player.setBounce(0.3);

    // 创建地面（底部）
    this.ground = this.physics.add.staticSprite(width / 2, height - 20, 'ground');
    this.ground.setDisplaySize(width, 40);
    this.ground.refreshBody();

    // 创建天花板（顶部）
    this.ceiling = this.physics.add.staticSprite(width / 2, 20, 'ground');
    this.ceiling.setDisplaySize(width, 40);
    this.ceiling.refreshBody();

    // 添加碰撞检测
    this.physics.add.collider(this.player, this.ground);
    this.physics.add.collider(this.player, this.ceiling);

    // 设置初始重力（向下）
    this.physics.world.gravity.y = 600;

    // 创建状态显示文本
    this.gravityText = this.add.text(16, 16, '', {
      fontSize: '24px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
    this.updateGravityText();

    // 创建提示文本
    this.add.text(16, height - 40, 'Click Left Mouse Button to Flip Gravity', {
      fontSize: '18px',
      fill: '#ffff00',
      backgroundColor: '#000000',
      padding: { x: 8, y: 4 }
    });

    // 添加鼠标左键点击事件
    this.input.on('pointerdown', (pointer) => {
      if (pointer.leftButtonDown()) {
        this.flipGravity();
      }
    });

    // 添加键盘空格键作为备用控制
    this.input.keyboard.on('keydown-SPACE', () => {
      this.flipGravity();
    });
  }

  flipGravity() {
    // 切换重力方向
    if (this.gravityDirection === 'DOWN') {
      this.gravityDirection = 'UP';
      this.physics.world.gravity.y = -600;
    } else {
      this.gravityDirection = 'DOWN';
      this.physics.world.gravity.y = 600;
    }

    this.flipCount++;
    this.updateGravityText();

    // 视觉反馈：翻转玩家精灵
    this.player.setFlipY(this.gravityDirection === 'UP');

    // 添加闪烁效果作为反馈
    this.tweens.add({
      targets: this.player,
      alpha: 0.3,
      duration: 100,
      yoyo: true,
      repeat: 1
    });
  }

  updateGravityText() {
    const direction = this.gravityDirection === 'DOWN' ? '↓ DOWN' : '↑ UP';
    this.gravityText.setText([
      `Gravity Direction: ${direction}`,
      `Gravity Value: ${this.physics.world.gravity.y}`,
      `Flip Count: ${this.flipCount}`
    ]);
  }

  update(time, delta) {
    // 显示玩家速度信息（可选，用于调试）
    if (this.player.body) {
      const velocityY = Math.round(this.player.body.velocity.y);
      // 可以在这里添加额外的调试信息
    }
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
      gravity: { y: 600 }, // 初始重力向下
      debug: false
    }
  },
  scene: GravityFlipScene
};

// 创建游戏实例
const game = new Phaser.Game(config);

// 导出状态信号用于验证（可选）
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { game, GravityFlipScene };
}