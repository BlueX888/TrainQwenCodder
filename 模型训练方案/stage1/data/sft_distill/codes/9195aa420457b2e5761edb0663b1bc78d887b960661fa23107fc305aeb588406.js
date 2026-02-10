class GravityScene extends Phaser.Scene {
  constructor() {
    super('GravityScene');
    this.gravityDirection = 'down'; // 状态信号：当前重力方向
    this.gravitySwitchCount = 0; // 状态信号：重力切换次数
    this.seed = 12345; // 固定随机种子
  }

  // 伪随机数生成器（确保确定性）
  seededRandom() {
    this.seed = (this.seed * 9301 + 49297) % 233280;
    return this.seed / 233280;
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 创建玩家纹理（蓝色方块）
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x0088ff, 1);
    playerGraphics.fillRect(0, 0, 40, 40);
    playerGraphics.generateTexture('player', 40, 40);
    playerGraphics.destroy();

    // 创建物体纹理（红色圆形）
    const objectGraphics = this.add.graphics();
    objectGraphics.fillStyle(0xff4444, 1);
    objectGraphics.fillCircle(15, 15, 15);
    objectGraphics.generateTexture('object', 30, 30);
    objectGraphics.destroy();

    // 创建玩家精灵
    this.player = this.physics.add.sprite(400, 100, 'player');
    this.player.setBounce(0.3);
    this.player.setCollideWorldBounds(true);

    // 创建8个物体精灵（固定位置，确保确定性）
    this.objects = this.physics.add.group();
    const positions = [
      { x: 150, y: 150 },
      { x: 650, y: 150 },
      { x: 150, y: 450 },
      { x: 650, y: 450 },
      { x: 300, y: 250 },
      { x: 500, y: 250 },
      { x: 300, y: 350 },
      { x: 500, y: 350 }
    ];

    positions.forEach(pos => {
      const obj = this.physics.add.sprite(pos.x, pos.y, 'object');
      obj.setBounce(0.4);
      obj.setCollideWorldBounds(true);
      this.objects.add(obj);
    });

    // 添加碰撞检测
    this.physics.add.collider(this.player, this.objects);
    this.physics.add.collider(this.objects, this.objects);

    // 设置键盘输入
    this.cursors = this.input.keyboard.createCursorKeys();

    // 添加文本显示当前重力方向和切换次数
    this.infoText = this.add.text(10, 10, '', {
      fontSize: '18px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 添加提示文本
    this.add.text(400, 580, 'Press Arrow Keys to Change Gravity Direction', {
      fontSize: '16px',
      fill: '#ffff00'
    }).setOrigin(0.5);

    // 更新信息显示
    this.updateInfoText();
  }

  update() {
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
    const gravityValue = 300;
    
    // 重置所有重力
    this.physics.world.gravity.x = 0;
    this.physics.world.gravity.y = 0;

    // 根据方向设置重力
    switch(direction) {
      case 'up':
        this.physics.world.gravity.y = -gravityValue;
        break;
      case 'down':
        this.physics.world.gravity.y = gravityValue;
        break;
      case 'left':
        this.physics.world.gravity.x = -gravityValue;
        break;
      case 'right':
        this.physics.world.gravity.x = gravityValue;
        break;
    }

    // 更新状态信号
    this.gravityDirection = direction;
    this.gravitySwitchCount++;
    
    // 更新显示
    this.updateInfoText();

    // 输出状态日志
    console.log(`Gravity switched to: ${direction}, Total switches: ${this.gravitySwitchCount}`);
  }

  updateInfoText() {
    this.infoText.setText(
      `Gravity Direction: ${this.gravityDirection.toUpperCase()}\n` +
      `Switch Count: ${this.gravitySwitchCount}\n` +
      `Gravity: (${this.physics.world.gravity.x}, ${this.physics.world.gravity.y})`
    );
  }
}

// 游戏配置
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#222222',
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 300 }, // 初始重力向下
      debug: false
    }
  },
  scene: GravityScene
};

// 创建游戏实例
const game = new Phaser.Game(config);