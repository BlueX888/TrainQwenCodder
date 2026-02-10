class GravityScene extends Phaser.Scene {
  constructor() {
    super('GravityScene');
    this.gravitySwitchCount = 0; // 状态信号：重力切换次数
    this.currentGravityDirection = 'down'; // 状态信号：当前重力方向
    this.seed = 12345; // 固定随机种子
  }

  // 简单的伪随机数生成器（保证确定性）
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
    playerGraphics.fillStyle(0x0099ff, 1);
    playerGraphics.fillRect(0, 0, 40, 40);
    playerGraphics.generateTexture('player', 40, 40);
    playerGraphics.destroy();

    // 创建物体纹理（红色圆形）
    const objectGraphics = this.add.graphics();
    objectGraphics.fillStyle(0xff3333, 1);
    objectGraphics.fillCircle(15, 15, 15);
    objectGraphics.generateTexture('object', 30, 30);
    objectGraphics.destroy();

    // 创建玩家（中心位置）
    this.player = this.physics.add.sprite(400, 300, 'player');
    this.player.setCollideWorldBounds(true);
    this.player.setBounce(0.3);

    // 创建10个物体
    this.objects = [];
    for (let i = 0; i < 10; i++) {
      const x = 100 + this.seededRandom() * 600;
      const y = 100 + this.seededRandom() * 400;
      const obj = this.physics.add.sprite(x, y, 'object');
      obj.setCollideWorldBounds(true);
      obj.setBounce(0.5);
      this.objects.push(obj);
    }

    // 添加物体之间的碰撞
    this.physics.add.collider(this.player, this.objects);
    this.physics.add.collider(this.objects, this.objects);

    // 设置初始重力（向下）
    this.physics.world.gravity.y = 200;

    // 创建方向键监听
    this.cursors = this.input.keyboard.createCursorKeys();

    // 添加状态显示文本
    this.statusText = this.add.text(10, 10, '', {
      fontSize: '16px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
    this.updateStatusText();

    // 添加提示文本
    this.add.text(10, 560, 'Use Arrow Keys to change gravity direction', {
      fontSize: '14px',
      fill: '#ffff00'
    });
  }

  update() {
    // 检测方向键按下（使用 justDown 避免重复触发）
    if (Phaser.Input.Keyboard.JustDown(this.cursors.up)) {
      this.setGravity(0, -200, 'up');
    } else if (Phaser.Input.Keyboard.JustDown(this.cursors.down)) {
      this.setGravity(0, 200, 'down');
    } else if (Phaser.Input.Keyboard.JustDown(this.cursors.left)) {
      this.setGravity(-200, 0, 'left');
    } else if (Phaser.Input.Keyboard.JustDown(this.cursors.right)) {
      this.setGravity(200, 0, 'right');
    }
  }

  setGravity(x, y, direction) {
    // 设置世界重力
    this.physics.world.gravity.x = x;
    this.physics.world.gravity.y = y;

    // 更新状态
    this.currentGravityDirection = direction;
    this.gravitySwitchCount++;

    // 更新显示
    this.updateStatusText();

    // 给所有物体一个小的初始速度，让效果更明显
    this.player.setVelocity(0, 0);
    this.objects.forEach(obj => {
      obj.setVelocity(
        (this.seededRandom() - 0.5) * 50,
        (this.seededRandom() - 0.5) * 50
      );
    });
  }

  updateStatusText() {
    this.statusText.setText([
      `Gravity Direction: ${this.currentGravityDirection.toUpperCase()}`,
      `Switch Count: ${this.gravitySwitchCount}`,
      `Gravity: (${this.physics.world.gravity.x}, ${this.physics.world.gravity.y})`
    ]);
  }
}

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

new Phaser.Game(config);