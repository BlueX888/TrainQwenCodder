class GravityScene extends Phaser.Scene {
  constructor() {
    super('GravityScene');
    this.gravityDirection = 'DOWN'; // 状态信号：当前重力方向
    this.objectCount = 10; // 状态信号：物体数量
  }

  preload() {
    // 使用程序化生成纹理，无需外部资源
  }

  create() {
    // 生成玩家纹理（蓝色方块）
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x0066ff, 1);
    playerGraphics.fillRect(0, 0, 32, 32);
    playerGraphics.generateTexture('player', 32, 32);
    playerGraphics.destroy();

    // 生成物体纹理（红色圆形）
    const objectGraphics = this.add.graphics();
    objectGraphics.fillStyle(0xff3333, 1);
    objectGraphics.fillCircle(16, 16, 16);
    objectGraphics.generateTexture('object', 32, 32);
    objectGraphics.destroy();

    // 创建玩家
    this.player = this.physics.add.sprite(400, 100, 'player');
    this.player.setCollideWorldBounds(true);
    this.player.setBounce(0.3);

    // 创建10个物体，使用固定种子确保确定性
    this.objects = this.physics.add.group();
    const positions = [
      [150, 200], [650, 200], [300, 350], [500, 350],
      [200, 150], [600, 150], [400, 400], [250, 500],
      [550, 500], [400, 250]
    ];

    for (let i = 0; i < this.objectCount; i++) {
      const obj = this.objects.create(positions[i][0], positions[i][1], 'object');
      obj.setCollideWorldBounds(true);
      obj.setBounce(0.4);
    }

    // 创建键盘输入
    this.cursors = this.input.keyboard.createCursorKeys();

    // 添加碰撞检测
    this.physics.add.collider(this.player, this.objects);
    this.physics.add.collider(this.objects, this.objects);

    // 显示状态信息
    this.statusText = this.add.text(16, 16, '', {
      fontSize: '20px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 添加说明文本
    this.add.text(16, 560, 'Use Arrow Keys to change gravity direction', {
      fontSize: '16px',
      fill: '#ffffff',
      backgroundColor: '#333333',
      padding: { x: 8, y: 4 }
    });

    // 初始化重力
    this.updateGravity();
  }

  update() {
    // 检测方向键按下（使用 JustDown 避免重复触发）
    if (Phaser.Input.Keyboard.JustDown(this.cursors.up)) {
      this.gravityDirection = 'UP';
      this.updateGravity();
    } else if (Phaser.Input.Keyboard.JustDown(this.cursors.down)) {
      this.gravityDirection = 'DOWN';
      this.updateGravity();
    } else if (Phaser.Input.Keyboard.JustDown(this.cursors.left)) {
      this.gravityDirection = 'LEFT';
      this.updateGravity();
    } else if (Phaser.Input.Keyboard.JustDown(this.cursors.right)) {
      this.gravityDirection = 'RIGHT';
      this.updateGravity();
    }

    // 更新状态显示
    this.statusText.setText([
      `Gravity Direction: ${this.gravityDirection}`,
      `Gravity: (${this.physics.world.gravity.x}, ${this.physics.world.gravity.y})`,
      `Objects: ${this.objectCount}`,
      `Player Pos: (${Math.round(this.player.x)}, ${Math.round(this.player.y)})`
    ]);
  }

  updateGravity() {
    const gravityStrength = 300;
    
    // 根据方向设置世界重力
    switch(this.gravityDirection) {
      case 'UP':
        this.physics.world.gravity.x = 0;
        this.physics.world.gravity.y = -gravityStrength;
        break;
      case 'DOWN':
        this.physics.world.gravity.x = 0;
        this.physics.world.gravity.y = gravityStrength;
        break;
      case 'LEFT':
        this.physics.world.gravity.x = -gravityStrength;
        this.physics.world.gravity.y = 0;
        break;
      case 'RIGHT':
        this.physics.world.gravity.x = gravityStrength;
        this.physics.world.gravity.y = 0;
        break;
    }
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
      gravity: { x: 0, y: 300 },
      debug: false
    }
  },
  scene: GravityScene
};

new Phaser.Game(config);