// 四向重力切换游戏
class GravityScene extends Phaser.Scene {
  constructor() {
    super('GravityScene');
    // 状态信号变量
    this.currentGravityDirection = 'down'; // down, up, left, right
    this.gravitySwitchCount = 0; // 重力切换次数
    this.gravityMagnitude = 300; // 重力大小
  }

  preload() {
    // 使用Graphics创建纹理，无需外部资源
  }

  create() {
    // 创建玩家纹理（蓝色方块）
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x0088ff, 1);
    playerGraphics.fillRect(0, 0, 32, 32);
    playerGraphics.generateTexture('player', 32, 32);
    playerGraphics.destroy();

    // 创建物体纹理（红色圆形）
    const objectGraphics = this.add.graphics();
    objectGraphics.fillStyle(0xff4444, 1);
    objectGraphics.fillCircle(12, 12, 12);
    objectGraphics.generateTexture('object', 24, 24);
    objectGraphics.destroy();

    // 创建玩家
    this.player = this.physics.add.sprite(400, 100, 'player');
    this.player.setCollideWorldBounds(true);
    this.player.setBounce(0.3);

    // 创建20个物体数组
    this.objects = [];
    const seed = 12345; // 固定种子保证确定性
    let random = this.createSeededRandom(seed);

    for (let i = 0; i < 20; i++) {
      const x = 50 + random() * 700;
      const y = 50 + random() * 500;
      const obj = this.physics.add.sprite(x, y, 'object');
      obj.setCollideWorldBounds(true);
      obj.setBounce(0.4);
      this.objects.push(obj);
    }

    // 设置物体之间的碰撞
    this.physics.add.collider(this.player, this.objects);
    this.physics.add.collider(this.objects, this.objects);

    // 创建方向键输入
    this.cursors = this.input.keyboard.createCursorKeys();

    // 添加WASD键作为备选
    this.keyW = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
    this.keyA = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
    this.keyS = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
    this.keyD = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);

    // 创建UI文本显示当前状态
    this.statusText = this.add.text(10, 10, '', {
      fontSize: '16px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 添加说明文本
    this.add.text(10, 550, 'Press Arrow Keys or WASD to switch gravity direction', {
      fontSize: '14px',
      fill: '#ffff00'
    });

    this.updateStatusText();
  }

  update(time, delta) {
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
  }

  setGravity(direction) {
    if (this.currentGravityDirection === direction) {
      return; // 方向未改变，不处理
    }

    this.currentGravityDirection = direction;
    this.gravitySwitchCount++;

    // 根据方向设置世界重力
    switch (direction) {
      case 'up':
        this.physics.world.gravity.x = 0;
        this.physics.world.gravity.y = -this.gravityMagnitude;
        break;
      case 'down':
        this.physics.world.gravity.x = 0;
        this.physics.world.gravity.y = this.gravityMagnitude;
        break;
      case 'left':
        this.physics.world.gravity.x = -this.gravityMagnitude;
        this.physics.world.gravity.y = 0;
        break;
      case 'right':
        this.physics.world.gravity.x = this.gravityMagnitude;
        this.physics.world.gravity.y = 0;
        break;
    }

    this.updateStatusText();
  }

  updateStatusText() {
    const directionSymbols = {
      'up': '↑',
      'down': '↓',
      'left': '←',
      'right': '→'
    };

    this.statusText.setText([
      `Gravity Direction: ${directionSymbols[this.currentGravityDirection]} ${this.currentGravityDirection.toUpperCase()}`,
      `Gravity Magnitude: ${this.gravityMagnitude}`,
      `Switch Count: ${this.gravitySwitchCount}`,
      `Objects: ${this.objects.length + 1}` // +1 for player
    ]);
  }

  // 创建固定种子的随机数生成器
  createSeededRandom(seed) {
    let state = seed;
    return function() {
      state = (state * 9301 + 49297) % 233280;
      return state / 233280;
    };
  }
}

// Phaser 游戏配置
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
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