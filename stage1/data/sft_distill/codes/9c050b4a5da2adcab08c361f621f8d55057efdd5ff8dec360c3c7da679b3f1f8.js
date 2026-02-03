class GravityScene extends Phaser.Scene {
  constructor() {
    super('GravityScene');
    this.gravityDirection = 'DOWN'; // 状态信号：当前重力方向
    this.switchCount = 0; // 状态信号：切换次数
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    const { width, height } = this.cameras.main;

    // 创建玩家纹理（使用 Graphics 程序化生成）
    const graphics = this.add.graphics();
    graphics.fillStyle(0x00ff00, 1);
    graphics.fillRect(0, 0, 40, 40);
    graphics.generateTexture('player', 40, 40);
    graphics.destroy();

    // 创建玩家精灵（物理对象）
    this.player = this.physics.add.sprite(width / 2, height / 2, 'player');
    this.player.setBounce(0.3);
    this.player.setCollideWorldBounds(true);

    // 设置初始重力（向下）
    this.physics.world.gravity.y = 300;

    // 创建显示文本
    this.gravityText = this.add.text(16, 16, 'Gravity: DOWN', {
      fontSize: '24px',
      fontFamily: 'Arial',
      color: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    this.switchText = this.add.text(16, 50, 'Switches: 0', {
      fontSize: '18px',
      fontFamily: 'Arial',
      color: '#ffff00',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 添加说明文本
    this.add.text(width / 2, height - 30, 'Click to toggle gravity direction', {
      fontSize: '16px',
      fontFamily: 'Arial',
      color: '#cccccc'
    }).setOrigin(0.5);

    // 监听鼠标左键点击事件
    this.input.on('pointerdown', (pointer) => {
      if (pointer.leftButtonDown()) {
        this.toggleGravity();
      }
    });

    // 添加键盘空格键作为备用切换方式
    this.input.keyboard.on('keydown-SPACE', () => {
      this.toggleGravity();
    });
  }

  toggleGravity() {
    // 切换重力方向
    if (this.gravityDirection === 'DOWN') {
      this.physics.world.gravity.y = -300;
      this.gravityDirection = 'UP';
      this.gravityText.setText('Gravity: UP');
    } else {
      this.physics.world.gravity.y = 300;
      this.gravityDirection = 'DOWN';
      this.gravityText.setText('Gravity: DOWN');
    }

    // 更新切换次数
    this.switchCount++;
    this.switchText.setText(`Switches: ${this.switchCount}`);

    // 给玩家一个小的初始速度，让效果更明显
    const impulse = this.gravityDirection === 'UP' ? -100 : 100;
    this.player.setVelocityY(impulse);
  }

  update(time, delta) {
    // 可选：添加视觉反馈，根据重力方向旋转玩家
    if (this.gravityDirection === 'UP') {
      this.player.angle = Phaser.Math.Linear(this.player.angle, 180, 0.1);
    } else {
      this.player.angle = Phaser.Math.Linear(this.player.angle, 0, 0.1);
    }

    // 边界检测提示（可选）
    if (this.player.y <= 20 || this.player.y >= this.cameras.main.height - 20) {
      // 玩家接触上下边界
      this.player.setTint(0xff0000);
    } else {
      this.player.clearTint();
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
      gravity: { y: 0 }, // 初始重力在 create 中设置
      debug: false
    }
  },
  scene: GravityScene
};

// 创建游戏实例
new Phaser.Game(config);