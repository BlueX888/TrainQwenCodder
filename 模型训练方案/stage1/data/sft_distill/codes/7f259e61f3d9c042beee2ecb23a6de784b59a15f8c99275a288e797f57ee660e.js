class GravityScene extends Phaser.Scene {
  constructor() {
    super('GravityScene');
    this.gravityDirection = 'down'; // 状态信号：当前重力方向
    this.gravityValue = 600; // 重力大小
    this.switchCount = 0; // 状态信号：切换次数
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 创建玩家纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0x00ff00, 1);
    graphics.fillCircle(16, 16, 16);
    graphics.generateTexture('player', 32, 32);
    graphics.destroy();

    // 创建玩家精灵（物理精灵）
    this.player = this.physics.add.sprite(400, 300, 'player');
    this.player.setBounce(0.3);
    this.player.setCollideWorldBounds(true);

    // 设置初始重力（向下）
    this.physics.world.gravity.y = this.gravityValue;

    // 创建地面和天花板（用于视觉参考）
    const groundGraphics = this.add.graphics();
    groundGraphics.fillStyle(0x8B4513, 1);
    groundGraphics.fillRect(0, 560, 800, 40);

    const ceilingGraphics = this.add.graphics();
    ceilingGraphics.fillStyle(0x4169E1, 1);
    ceilingGraphics.fillRect(0, 0, 800, 40);

    // 添加状态文本
    this.gravityText = this.add.text(16, 50, '', {
      fontSize: '24px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    this.statsText = this.add.text(16, 90, '', {
      fontSize: '18px',
      fill: '#ffff00',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 添加说明文本
    this.add.text(400, 300, 'Press SPACE to toggle gravity', {
      fontSize: '20px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    }).setOrigin(0.5);

    // 监听空格键
    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    
    // 防止按住空格连续触发
    this.canSwitch = true;

    // 更新初始文本
    this.updateStatusText();
  }

  update(time, delta) {
    // 检测空格键按下（带防抖）
    if (this.spaceKey.isDown && this.canSwitch) {
      this.toggleGravity();
      this.canSwitch = false;
    }

    // 空格键释放后允许再次切换
    if (this.spaceKey.isUp) {
      this.canSwitch = true;
    }

    // 更新状态文本
    this.updateStatusText();

    // 根据重力方向旋转玩家（视觉反馈）
    if (this.gravityDirection === 'down') {
      this.player.rotation = Phaser.Math.Linear(this.player.rotation, 0, 0.1);
    } else {
      this.player.rotation = Phaser.Math.Linear(this.player.rotation, Math.PI, 0.1);
    }
  }

  toggleGravity() {
    // 切换重力方向
    if (this.gravityDirection === 'down') {
      // 切换到向上
      this.gravityDirection = 'up';
      this.physics.world.gravity.y = -this.gravityValue;
      
      // 给玩家一个初始速度，使效果更明显
      this.player.setVelocityY(-200);
    } else {
      // 切换到向下
      this.gravityDirection = 'down';
      this.physics.world.gravity.y = this.gravityValue;
      
      // 给玩家一个初始速度
      this.player.setVelocityY(200);
    }

    // 增加切换计数
    this.switchCount++;

    // 播放视觉反馈
    this.cameras.main.shake(100, 0.005);
  }

  updateStatusText() {
    // 更新重力方向文本
    const arrow = this.gravityDirection === 'down' ? '↓' : '↑';
    this.gravityText.setText(`Gravity: ${arrow} ${this.gravityDirection.toUpperCase()} (${this.gravityValue})`);

    // 更新统计信息
    const playerY = Math.round(this.player.y);
    const velocityY = Math.round(this.player.body.velocity.y);
    this.statsText.setText(
      `Switches: ${this.switchCount} | Y: ${playerY} | Velocity: ${velocityY}`
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
      gravity: { y: 0 }, // 初始重力在create中设置
      debug: false
    }
  },
  scene: GravityScene
};

// 创建游戏实例
const game = new Phaser.Game(config);