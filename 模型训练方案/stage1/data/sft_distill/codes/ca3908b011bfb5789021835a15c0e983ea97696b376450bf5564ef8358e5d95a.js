class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.gravityDirection = 'down'; // 可验证状态：当前重力方向
    this.gravityValue = 600; // 可验证状态：重力大小
  }

  preload() {
    // 无需预加载外部资源
  }

  create() {
    // 创建玩家纹理（使用 Graphics）
    const graphics = this.add.graphics();
    graphics.fillStyle(0x00ff00, 1);
    graphics.fillCircle(16, 16, 16);
    graphics.generateTexture('player', 32, 32);
    graphics.destroy();

    // 创建玩家精灵，位置在屏幕中央
    this.player = this.physics.add.sprite(400, 300, 'player');
    this.player.setBounce(0.3);
    this.player.setCollideWorldBounds(true);

    // 设置初始重力（向下）
    this.physics.world.gravity.y = this.gravityValue;

    // 创建地板和天花板（用于碰撞检测）
    const ground = this.add.graphics();
    ground.fillStyle(0x8b4513, 1);
    ground.fillRect(0, 580, 800, 20);

    const ceiling = this.add.graphics();
    ceiling.fillStyle(0x8b4513, 1);
    ceiling.fillRect(0, 0, 800, 20);

    // 添加文本显示当前重力方向
    this.gravityText = this.add.text(16, 16, '', {
      fontSize: '24px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
    this.updateGravityText();

    // 添加状态信息文本
    this.statusText = this.add.text(16, 60, '', {
      fontSize: '18px',
      fill: '#ffff00',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 监听空格键
    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    
    // 防止连续触发，使用 justDown 检测
    this.lastSpacePress = 0;

    // 添加说明文本
    this.add.text(400, 100, '按空格键切换重力方向', {
      fontSize: '20px',
      fill: '#ffffff',
      backgroundColor: '#333333',
      padding: { x: 10, y: 5 }
    }).setOrigin(0.5);
  }

  update(time, delta) {
    // 检测空格键按下（使用时间间隔防止连续触发）
    if (Phaser.Input.Keyboard.JustDown(this.spaceKey)) {
      this.toggleGravity();
    }

    // 更新状态信息
    this.updateStatusText();

    // 根据重力方向调整玩家朝向（视觉反馈）
    if (this.gravityDirection === 'down') {
      this.player.setFlipY(false);
    } else {
      this.player.setFlipY(true);
    }
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

    // 给玩家一个小的初始速度，增强切换效果
    if (this.gravityDirection === 'up') {
      this.player.setVelocityY(-100);
    } else {
      this.player.setVelocityY(100);
    }
  }

  updateGravityText() {
    const arrow = this.gravityDirection === 'down' ? '↓' : '↑';
    this.gravityText.setText(`重力方向: ${arrow} ${this.gravityDirection.toUpperCase()}`);
  }

  updateStatusText() {
    const velocityY = Math.round(this.player.body.velocity.y);
    const posY = Math.round(this.player.y);
    this.statusText.setText(
      `玩家Y坐标: ${posY}\n` +
      `Y速度: ${velocityY}\n` +
      `重力值: ${this.physics.world.gravity.y}`
    );
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
  scene: GameScene
};

// 启动游戏
new Phaser.Game(config);