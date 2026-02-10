class GravityScene extends Phaser.Scene {
  constructor() {
    super('GravityScene');
    this.gravityDirection = 'down'; // 状态信号：当前重力方向
    this.gravitySwitchCount = 0;    // 状态信号：重力切换次数
    this.gravityMagnitude = 200;    // 重力大小
  }

  preload() {
    // 使用 Graphics 创建纹理，无需外部资源
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

    // 创建玩家（绿色圆形）
    this.player = this.physics.add.sprite(400, 100, 'player');
    this.player.setCollideWorldBounds(true);
    this.player.setBounce(0.3);
    this.player.setDamping(true);
    this.player.setDrag(0.95);

    // 创建 10 个物体（橙色方块）
    this.objects = [];
    const seed = 12345; // 固定随机种子
    Phaser.Math.RND.sow([seed]);
    
    for (let i = 0; i < 10; i++) {
      const x = Phaser.Math.RND.between(50, 750);
      const y = Phaser.Math.RND.between(50, 550);
      const obj = this.physics.add.sprite(x, y, 'object');
      obj.setCollideWorldBounds(true);
      obj.setBounce(0.4);
      obj.setDamping(true);
      obj.setDrag(0.95);
      this.objects.push(obj);
    }

    // 添加玩家与物体的碰撞
    this.physics.add.collider(this.player, this.objects);
    // 添加物体之间的碰撞
    this.physics.add.collider(this.objects, this.objects);

    // 设置初始重力（向下）
    this.physics.world.gravity.y = this.gravityMagnitude;

    // 创建方向键控制
    this.cursors = this.input.keyboard.createCursorKeys();

    // 添加 WASD 键作为备选
    this.keyW = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
    this.keyA = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
    this.keyS = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
    this.keyD = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);

    // 创建文本显示当前状态
    this.statusText = this.add.text(10, 10, '', {
      fontSize: '16px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 添加说明文本
    this.add.text(10, 550, 'Arrow Keys / WASD: Change Gravity Direction', {
      fontSize: '14px',
      fill: '#ffff00'
    });

    this.updateStatusText();
  }

  update() {
    // 检测方向键按下，切换重力方向
    if (Phaser.Input.Keyboard.JustDown(this.cursors.up) || 
        Phaser.Input.Keyboard.JustDown(this.keyW)) {
      this.setGravity('up');
    } else if (Phaser.Input.Keyboard.JustDown(this.cursors.down) || 
               Phaser.Input.Keyboard.JustDown(this.keyS)) {
      this.setGravity('down');
    } else if (Phaser.Input.Keyboard.JustDown(this.cursors.left) || 
               Phaser.Input.Keyboard.JustDown(this.keyA)) {
      this.setGravity('left');
    } else if (Phaser.Input.Keyboard.JustDown(this.cursors.right) || 
               Phaser.Input.Keyboard.JustDown(this.keyD)) {
      this.setGravity('right');
    }

    this.updateStatusText();
  }

  setGravity(direction) {
    // 重置所有重力
    this.physics.world.gravity.x = 0;
    this.physics.world.gravity.y = 0;

    // 根据方向设置重力
    switch(direction) {
      case 'up':
        this.physics.world.gravity.y = -this.gravityMagnitude;
        break;
      case 'down':
        this.physics.world.gravity.y = this.gravityMagnitude;
        break;
      case 'left':
        this.physics.world.gravity.x = -this.gravityMagnitude;
        break;
      case 'right':
        this.physics.world.gravity.x = this.gravityMagnitude;
        break;
    }

    // 更新状态
    if (this.gravityDirection !== direction) {
      this.gravityDirection = direction;
      this.gravitySwitchCount++;
    }
  }

  updateStatusText() {
    const gravitySymbol = {
      'up': '↑',
      'down': '↓',
      'left': '←',
      'right': '→'
    };

    this.statusText.setText([
      `Gravity Direction: ${this.gravityDirection.toUpperCase()} ${gravitySymbol[this.gravityDirection]}`,
      `Gravity Switches: ${this.gravitySwitchCount}`,
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
      gravity: { y: 200 },
      debug: false
    }
  },
  scene: GravityScene
};

const game = new Phaser.Game(config);