// 四向重力切换游戏
class GravityScene extends Phaser.Scene {
  constructor() {
    super('GravityScene');
    this.gravityDirection = 'down'; // 状态信号：当前重力方向
    this.switchCount = 0; // 状态信号：切换次数
  }

  preload() {
    // 使用 Graphics 生成纹理，无需外部资源
  }

  create() {
    const { width, height } = this.cameras.main;

    // 生成玩家纹理（蓝色方块）
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x3498db, 1);
    playerGraphics.fillRect(0, 0, 40, 40);
    playerGraphics.generateTexture('player', 40, 40);
    playerGraphics.destroy();

    // 生成物体纹理（红色圆形）
    const objectGraphics = this.add.graphics();
    objectGraphics.fillStyle(0xe74c3c, 1);
    objectGraphics.fillCircle(15, 15, 15);
    objectGraphics.generateTexture('object', 30, 30);
    objectGraphics.destroy();

    // 创建玩家（中心位置）
    this.player = this.physics.add.sprite(width / 2, height / 2, 'player');
    this.player.setBounce(0.3);
    this.player.setCollideWorldBounds(true);

    // 创建 10 个物体（随机位置，使用固定种子确保确定性）
    this.objects = this.physics.add.group();
    const seed = 12345; // 固定种子
    let random = this.seededRandom(seed);
    
    for (let i = 0; i < 10; i++) {
      const x = 50 + random() * (width - 100);
      const y = 50 + random() * (height - 100);
      const obj = this.objects.create(x, y, 'object');
      obj.setBounce(0.5);
      obj.setCollideWorldBounds(true);
    }

    // 设置初始重力（向下）
    this.physics.world.gravity.y = 500;
    this.physics.world.gravity.x = 0;

    // 添加物体间碰撞
    this.physics.add.collider(this.player, this.objects);
    this.physics.add.collider(this.objects, this.objects);

    // 创建方向键输入
    this.cursors = this.input.keyboard.createCursorKeys();

    // 添加显示文本
    this.infoText = this.add.text(10, 10, '', {
      fontSize: '18px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 添加说明文本
    this.add.text(10, height - 60, 'Use Arrow Keys to Switch Gravity', {
      fontSize: '16px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    this.updateInfoText();
  }

  update(time, delta) {
    // 检测方向键按下并切换重力
    if (Phaser.Input.Keyboard.JustDown(this.cursors.up)) {
      this.setGravity('up');
    } else if (Phaser.Input.Keyboard.JustDown(this.cursors.down)) {
      this.setGravity('down');
    } else if (Phaser.Input.Keyboard.JustDown(this.cursors.left)) {
      this.setGravity('left');
    } else if (Phaser.Input.Keyboard.JustDown(this.cursors.right)) {
      this.setGravity('right');
    }
  }

  setGravity(direction) {
    const gravityStrength = 500;

    // 重置重力
    this.physics.world.gravity.x = 0;
    this.physics.world.gravity.y = 0;

    // 根据方向设置重力
    switch (direction) {
      case 'up':
        this.physics.world.gravity.y = -gravityStrength;
        break;
      case 'down':
        this.physics.world.gravity.y = gravityStrength;
        break;
      case 'left':
        this.physics.world.gravity.x = -gravityStrength;
        break;
      case 'right':
        this.physics.world.gravity.x = gravityStrength;
        break;
    }

    // 更新状态
    this.gravityDirection = direction;
    this.switchCount++;
    this.updateInfoText();
  }

  updateInfoText() {
    this.infoText.setText(
      `Gravity: ${this.gravityDirection.toUpperCase()}\n` +
      `Switches: ${this.switchCount}\n` +
      `Objects: ${this.objects.getChildren().length + 1}`
    );
  }

  // 简单的伪随机数生成器（确保确定性）
  seededRandom(seed) {
    let value = seed;
    return function() {
      value = (value * 9301 + 49297) % 233280;
      return value / 233280;
    };
  }
}

// 游戏配置
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2c3e50',
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 500 },
      debug: false
    }
  },
  scene: GravityScene
};

// 启动游戏
const game = new Phaser.Game(config);