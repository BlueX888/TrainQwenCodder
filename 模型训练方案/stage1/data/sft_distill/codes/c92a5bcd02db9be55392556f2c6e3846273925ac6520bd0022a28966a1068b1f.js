class GravityScene extends Phaser.Scene {
  constructor() {
    super('GravityScene');
    this.gravityDirection = 'DOWN'; // 状态信号：当前重力方向
    this.gravityValue = 400; // 重力大小
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 创建玩家纹理（使用 Graphics）
    const graphics = this.add.graphics();
    graphics.fillStyle(0x00ff00, 1);
    graphics.fillCircle(16, 16, 16);
    graphics.generateTexture('player', 32, 32);
    graphics.destroy();

    // 创建玩家精灵（物理对象）
    this.player = this.physics.add.sprite(400, 300, 'player');
    this.player.setCollideWorldBounds(true); // 与世界边界碰撞
    this.player.setBounce(0.3); // 添加一点弹性

    // 设置初始重力方向（向下）
    this.physics.world.gravity.y = this.gravityValue;

    // 创建地面（使用 Graphics）
    const ground = this.add.graphics();
    ground.fillStyle(0x8b4513, 1);
    ground.fillRect(0, 560, 800, 40);

    // 创建天花板（使用 Graphics）
    const ceiling = this.add.graphics();
    ceiling.fillStyle(0x8b4513, 1);
    ceiling.fillRect(0, 0, 800, 40);

    // 创建显示重力方向的文本
    this.gravityText = this.add.text(16, 16, 'Gravity: DOWN', {
      fontSize: '24px',
      fontFamily: 'Arial',
      color: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
    this.gravityText.setDepth(100); // 确保文本在最上层

    // 创建说明文本
    this.instructionText = this.add.text(16, 50, 'Press SPACE to toggle gravity', {
      fontSize: '18px',
      fontFamily: 'Arial',
      color: '#ffff00',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
    this.instructionText.setDepth(100);

    // 监听空格键
    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    
    // 防止重复触发，使用 justDown 检测
    this.lastSpacePress = 0;
  }

  update(time, delta) {
    // 检测空格键按下（使用时间间隔防止重复触发）
    if (Phaser.Input.Keyboard.JustDown(this.spaceKey)) {
      this.toggleGravity();
    }

    // 根据重力方向调整玩家朝向（可选的视觉反馈）
    if (this.gravityDirection === 'UP') {
      this.player.setTint(0xff6666); // 向上时显示红色
    } else {
      this.player.setTint(0xffffff); // 向下时显示正常颜色
    }
  }

  toggleGravity() {
    // 切换重力方向
    if (this.gravityDirection === 'DOWN') {
      // 切换到向上
      this.gravityDirection = 'UP';
      this.physics.world.gravity.y = -this.gravityValue;
      this.gravityText.setText('Gravity: UP');
      
      // 给玩家一个初始速度，让效果更明显
      this.player.setVelocityY(-50);
    } else {
      // 切换到向下
      this.gravityDirection = 'DOWN';
      this.physics.world.gravity.y = this.gravityValue;
      this.gravityText.setText('Gravity: DOWN');
      
      // 给玩家一个初始速度，让效果更明显
      this.player.setVelocityY(50);
    }

    console.log(`Gravity switched to: ${this.gravityDirection}, value: ${this.physics.world.gravity.y}`);
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
      gravity: { y: 400 }, // 初始重力向下 400
      debug: false
    }
  },
  scene: GravityScene
};

// 创建游戏实例
const game = new Phaser.Game(config);

// 暴露场景实例用于测试验证
game.scene.scenes[0].events.on('create', () => {
  console.log('Game created. Press SPACE to toggle gravity.');
  console.log('Initial gravity direction:', game.scene.scenes[0].gravityDirection);
});