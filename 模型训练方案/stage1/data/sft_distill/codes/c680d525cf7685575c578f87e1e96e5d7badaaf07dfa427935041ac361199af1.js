class GravityScene extends Phaser.Scene {
  constructor() {
    super('GravityScene');
    this.gravitySwitchCount = 0; // 状态信号：重力切换次数
    this.currentGravityDirection = 'down'; // 当前重力方向
  }

  preload() {
    // 使用Graphics生成纹理，无需外部资源
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
    objectGraphics.fillStyle(0xff3333, 1);
    objectGraphics.fillCircle(15, 15, 15);
    objectGraphics.generateTexture('object', 30, 30);
    objectGraphics.destroy();

    // 创建玩家（物理精灵）
    this.player = this.physics.add.sprite(400, 100, 'player');
    this.player.setBounce(0.3);
    this.player.setCollideWorldBounds(true);

    // 创建10个物理物体
    this.objects = this.physics.add.group();
    
    // 使用固定种子生成确定性位置
    const seed = 12345;
    let random = this.seededRandom(seed);
    
    for (let i = 0; i < 10; i++) {
      const x = 100 + random() * 600;
      const y = 100 + random() * 400;
      const obj = this.objects.create(x, y, 'object');
      obj.setBounce(0.4);
      obj.setCollideWorldBounds(true);
    }

    // 设置物体之间的碰撞
    this.physics.add.collider(this.player, this.objects);
    this.physics.add.collider(this.objects, this.objects);

    // 创建方向键输入
    this.cursors = this.input.keyboard.createCursorKeys();

    // 添加UI文本显示当前状态
    this.infoText = this.add.text(16, 16, '', {
      fontSize: '18px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
    this.infoText.setScrollFactor(0);
    this.infoText.setDepth(100);

    // 添加提示文本
    this.add.text(16, 560, 'Use Arrow Keys to change gravity direction', {
      fontSize: '16px',
      fill: '#ffff00'
    });

    this.updateInfoText();
  }

  update() {
    // 检测方向键按下并切换重力
    if (Phaser.Input.Keyboard.JustDown(this.cursors.up)) {
      this.switchGravity(0, -1000, 'up');
    } else if (Phaser.Input.Keyboard.JustDown(this.cursors.down)) {
      this.switchGravity(0, 1000, 'down');
    } else if (Phaser.Input.Keyboard.JustDown(this.cursors.left)) {
      this.switchGravity(-1000, 0, 'left');
    } else if (Phaser.Input.Keyboard.JustDown(this.cursors.right)) {
      this.switchGravity(1000, 0, 'right');
    }
  }

  switchGravity(x, y, direction) {
    // 切换世界重力
    this.physics.world.gravity.x = x;
    this.physics.world.gravity.y = y;
    
    // 更新状态
    this.currentGravityDirection = direction;
    this.gravitySwitchCount++;
    
    // 更新UI
    this.updateInfoText();
    
    // 视觉反馈：短暂闪烁
    this.cameras.main.flash(100, 255, 255, 255, false, 0.3);
  }

  updateInfoText() {
    const gravityVector = `(${this.physics.world.gravity.x}, ${this.physics.world.gravity.y})`;
    this.infoText.setText([
      `Gravity Direction: ${this.currentGravityDirection.toUpperCase()}`,
      `Gravity Vector: ${gravityVector}`,
      `Switch Count: ${this.gravitySwitchCount}`
    ]);
  }

  // 确定性随机数生成器
  seededRandom(seed) {
    let value = seed;
    return function() {
      value = (value * 9301 + 49297) % 233280;
      return value / 233280;
    };
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
      gravity: { x: 0, y: 1000 }, // 初始重力向下
      debug: false
    }
  },
  scene: GravityScene
};

new Phaser.Game(config);