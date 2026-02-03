class GravityScene extends Phaser.Scene {
  constructor() {
    super('GravityScene');
    this.gravityDirection = 'DOWN'; // 状态信号：当前重力方向
    this.objectCount = 10; // 状态信号：物体数量
    this.gravitySwitchCount = 0; // 状态信号：重力切换次数
  }

  preload() {
    // 使用Graphics创建纹理，无需外部资源
  }

  create() {
    // 创建玩家纹理
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x00ff00, 1);
    playerGraphics.fillCircle(16, 16, 16);
    playerGraphics.generateTexture('player', 32, 32);
    playerGraphics.destroy();

    // 创建物体纹理
    const objectGraphics = this.add.graphics();
    objectGraphics.fillStyle(0xff6600, 1);
    objectGraphics.fillRect(0, 0, 24, 24);
    objectGraphics.generateTexture('object', 24, 24);
    objectGraphics.destroy();

    // 创建玩家
    this.player = this.physics.add.sprite(400, 100, 'player');
    this.player.setBounce(0.3);
    this.player.setCollideWorldBounds(true);

    // 创建10个物体（使用固定种子保证确定性）
    this.objects = this.physics.add.group();
    const positions = [
      {x: 100, y: 150}, {x: 250, y: 200}, {x: 400, y: 250},
      {x: 550, y: 200}, {x: 700, y: 150}, {x: 150, y: 350},
      {x: 300, y: 400}, {x: 500, y: 400}, {x: 650, y: 350},
      {x: 400, y: 500}
    ];

    for (let i = 0; i < this.objectCount; i++) {
      const obj = this.objects.create(positions[i].x, positions[i].y, 'object');
      obj.setBounce(0.4);
      obj.setCollideWorldBounds(true);
    }

    // 物体之间的碰撞
    this.physics.add.collider(this.objects, this.objects);
    this.physics.add.collider(this.player, this.objects);

    // 设置方向键监听
    this.cursors = this.input.keyboard.createCursorKeys();
    
    // 添加独立的方向键监听（用于重力切换）
    this.keyW = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
    this.keyA = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
    this.keyS = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
    this.keyD = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);

    // 创建状态文本显示
    this.statusText = this.add.text(10, 10, '', {
      fontSize: '16px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 创建提示文本
    this.add.text(10, 560, 'Use Arrow Keys or WASD to switch gravity direction', {
      fontSize: '14px',
      fill: '#ffff00'
    });

    // 初始化重力
    this.updateGravity('DOWN');
  }

  update(time, delta) {
    // 检测方向键切换重力
    if (Phaser.Input.Keyboard.JustDown(this.cursors.up) || 
        Phaser.Input.Keyboard.JustDown(this.keyW)) {
      this.updateGravity('UP');
    } else if (Phaser.Input.Keyboard.JustDown(this.cursors.down) || 
               Phaser.Input.Keyboard.JustDown(this.keyS)) {
      this.updateGravity('DOWN');
    } else if (Phaser.Input.Keyboard.JustDown(this.cursors.left) || 
               Phaser.Input.Keyboard.JustDown(this.keyA)) {
      this.updateGravity('LEFT');
    } else if (Phaser.Input.Keyboard.JustDown(this.cursors.right) || 
               Phaser.Input.Keyboard.JustDown(this.keyD)) {
      this.updateGravity('RIGHT');
    }

    // 更新状态显示
    this.updateStatusText();
  }

  updateGravity(direction) {
    const gravityStrength = 200;
    
    // 重置重力
    this.physics.world.gravity.x = 0;
    this.physics.world.gravity.y = 0;

    // 根据方向设置重力
    switch(direction) {
      case 'UP':
        this.physics.world.gravity.y = -gravityStrength;
        break;
      case 'DOWN':
        this.physics.world.gravity.y = gravityStrength;
        break;
      case 'LEFT':
        this.physics.world.gravity.x = -gravityStrength;
        break;
      case 'RIGHT':
        this.physics.world.gravity.x = gravityStrength;
        break;
    }

    // 更新状态信号
    if (this.gravityDirection !== direction) {
      this.gravityDirection = direction;
      this.gravitySwitchCount++;
    }
  }

  updateStatusText() {
    // 计算活动物体数量（在视野内的物体）
    const activeObjects = this.objects.getChildren().filter(obj => {
      return obj.x >= 0 && obj.x <= 800 && obj.y >= 0 && obj.y <= 600;
    }).length;

    // 更新状态文本
    this.statusText.setText([
      `Gravity Direction: ${this.gravityDirection}`,
      `Gravity Strength: 200`,
      `Objects Count: ${activeObjects}/${this.objectCount}`,
      `Switch Count: ${this.gravitySwitchCount}`,
      `Player Position: (${Math.floor(this.player.x)}, ${Math.floor(this.player.y)})`
    ]);
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
      gravity: { y: 200 },
      debug: false
    }
  },
  scene: GravityScene
};

// 启动游戏
new Phaser.Game(config);