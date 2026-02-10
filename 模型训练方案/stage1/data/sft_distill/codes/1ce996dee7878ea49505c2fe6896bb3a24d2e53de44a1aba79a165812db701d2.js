class GravityToggleScene extends Phaser.Scene {
  constructor() {
    super('GravityToggleScene');
    this.gravityDirection = 'down'; // 状态信号：当前重力方向
    this.toggleCount = 0; // 状态信号：切换次数
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    const { width, height } = this.cameras.main;

    // 创建玩家纹理（使用 Graphics）
    const graphics = this.add.graphics();
    graphics.fillStyle(0x00ff00, 1);
    graphics.fillCircle(16, 16, 16);
    graphics.generateTexture('player', 32, 32);
    graphics.destroy();

    // 创建玩家精灵（物理对象）
    this.player = this.physics.add.sprite(width / 2, height / 2, 'player');
    this.player.setBounce(0.3);
    this.player.setCollideWorldBounds(true);

    // 设置初始重力方向（向下）
    this.physics.world.gravity.y = 400;

    // 创建地面和天花板（用于视觉参考）
    const groundGraphics = this.add.graphics();
    groundGraphics.fillStyle(0x8b4513, 1);
    groundGraphics.fillRect(0, height - 40, width, 40);

    const ceilingGraphics = this.add.graphics();
    ceilingGraphics.fillStyle(0x4169e1, 1);
    ceilingGraphics.fillRect(0, 0, width, 40);

    // 显示当前重力方向的文本
    this.gravityText = this.add.text(16, 60, 'Gravity: DOWN', {
      fontSize: '24px',
      color: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 显示切换次数
    this.toggleText = this.add.text(16, 100, 'Toggle Count: 0', {
      fontSize: '20px',
      color: '#ffff00',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 显示操作提示
    this.add.text(16, 140, 'Press SPACE to toggle gravity', {
      fontSize: '18px',
      color: '#aaaaaa',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 监听空格键
    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    
    // 防止连续触发，使用 justDown 检测
    this.lastToggleTime = 0;
  }

  update(time, delta) {
    // 检测空格键按下（带防抖，至少间隔 200ms）
    if (Phaser.Input.Keyboard.JustDown(this.spaceKey) && time - this.lastToggleTime > 200) {
      this.toggleGravity();
      this.lastToggleTime = time;
    }

    // 可选：显示玩家速度信息（用于调试）
    if (!this.velocityText) {
      this.velocityText = this.add.text(16, 180, '', {
        fontSize: '16px',
        color: '#00ffff',
        backgroundColor: '#000000',
        padding: { x: 10, y: 5 }
      });
    }
    this.velocityText.setText(`Velocity Y: ${this.player.body.velocity.y.toFixed(1)}`);
  }

  toggleGravity() {
    // 切换重力方向
    if (this.gravityDirection === 'down') {
      // 切换到向上
      this.physics.world.gravity.y = -400;
      this.gravityDirection = 'up';
      this.gravityText.setText('Gravity: UP');
      this.gravityText.setColor('#ff0000');
      
      // 翻转玩家精灵（视觉效果）
      this.player.setFlipY(true);
    } else {
      // 切换到向下
      this.physics.world.gravity.y = 400;
      this.gravityDirection = 'down';
      this.gravityText.setText('Gravity: DOWN');
      this.gravityText.setColor('#ffffff');
      
      // 恢复玩家精灵方向
      this.player.setFlipY(false);
    }

    // 更新切换次数
    this.toggleCount++;
    this.toggleText.setText(`Toggle Count: ${this.toggleCount}`);

    // 添加视觉反馈：闪烁效果
    this.cameras.main.flash(100, 255, 255, 255, false);

    console.log(`Gravity toggled to: ${this.gravityDirection}, Count: ${this.toggleCount}`);
  }
}

// Phaser 游戏配置
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 400 }, // 初始重力向下
      debug: false
    }
  },
  scene: GravityToggleScene
};

// 启动游戏
const game = new Phaser.Game(config);