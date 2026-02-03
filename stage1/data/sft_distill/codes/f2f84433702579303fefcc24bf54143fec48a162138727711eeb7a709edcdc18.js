class GravityGameScene extends Phaser.Scene {
  constructor() {
    super('GravityGameScene');
    this.gravityDirection = 'down'; // 状态信号：'down' 或 'up'
    this.gravityValue = 200;
  }

  preload() {
    // 使用 Graphics 生成玩家纹理，无需外部资源
  }

  create() {
    // 创建玩家纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0x00ff00, 1);
    graphics.fillCircle(16, 16, 16);
    graphics.generateTexture('player', 32, 32);
    graphics.destroy();

    // 创建玩家精灵，居中位置
    this.player = this.physics.add.sprite(400, 300, 'player');
    this.player.setCollideWorldBounds(true);
    this.player.setBounce(0.3);

    // 设置初始重力（向下）
    this.physics.world.gravity.y = this.gravityValue;

    // 创建状态显示文本
    this.gravityText = this.add.text(20, 20, '', {
      fontSize: '24px',
      color: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
    this.updateGravityText();

    // 创建提示文本
    this.add.text(20, 60, 'Click to toggle gravity', {
      fontSize: '18px',
      color: '#cccccc'
    });

    // 监听鼠标左键点击事件
    this.input.on('pointerdown', (pointer) => {
      if (pointer.leftButtonDown()) {
        this.toggleGravity();
      }
    });

    // 添加视觉参考线（地面和天花板）
    const groundGraphics = this.add.graphics();
    groundGraphics.fillStyle(0x8B4513, 1);
    groundGraphics.fillRect(0, 580, 800, 20);

    const ceilingGraphics = this.add.graphics();
    ceilingGraphics.fillStyle(0x4169E1, 1);
    ceilingGraphics.fillRect(0, 0, 800, 20);
  }

  toggleGravity() {
    // 切换重力方向
    if (this.gravityDirection === 'down') {
      this.gravityDirection = 'up';
      this.physics.world.gravity.y = -this.gravityValue;
    } else {
      this.gravityDirection = 'down';
      this.physics.world.gravity.y = this.gravityValue;
    }

    // 更新显示文本
    this.updateGravityText();

    // 添加视觉反馈：玩家闪烁
    this.tweens.add({
      targets: this.player,
      alpha: 0.3,
      duration: 100,
      yoyo: true,
      repeat: 1
    });
  }

  updateGravityText() {
    const arrow = this.gravityDirection === 'down' ? '↓' : '↑';
    this.gravityText.setText(`Gravity: ${arrow} ${this.gravityDirection.toUpperCase()}`);
    
    // 根据方向改变文本颜色
    const color = this.gravityDirection === 'down' ? '#ff6666' : '#6666ff';
    this.gravityText.setColor(color);
  }

  update(time, delta) {
    // 显示玩家位置和速度信息（用于调试验证）
    if (!this.debugText) {
      this.debugText = this.add.text(20, 100, '', {
        fontSize: '14px',
        color: '#ffff00'
      });
    }

    this.debugText.setText([
      `Position: (${Math.round(this.player.x)}, ${Math.round(this.player.y)})`,
      `Velocity Y: ${Math.round(this.player.body.velocity.y)}`,
      `Gravity: ${this.physics.world.gravity.y}`
    ]);
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
      gravity: { y: 0 }, // 初始重力在 create 中设置
      debug: false
    }
  },
  scene: GravityGameScene
};

// 创建游戏实例
const game = new Phaser.Game(config);

// 暴露场景实例用于验证状态
game.scene.scenes[0].events.on('create', () => {
  window.gravityScene = game.scene.scenes[0];
  console.log('Game ready! Click to toggle gravity.');
  console.log('Access gravityScene.gravityDirection to check current state.');
});