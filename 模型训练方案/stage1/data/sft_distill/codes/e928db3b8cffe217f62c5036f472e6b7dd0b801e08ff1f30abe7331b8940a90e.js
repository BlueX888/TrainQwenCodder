class GravityScene extends Phaser.Scene {
  constructor() {
    super('GravityScene');
    this.gravityDirection = 'down'; // 状态信号：当前重力方向
    this.gravitySwitchCount = 0; // 状态信号：重力切换次数
    this.gravityMagnitude = 300;
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

    // 创建12个物体，使用固定种子确保位置确定性
    this.objects = [];
    const seed = 12345;
    const positions = this.generatePositions(12, seed);
    
    for (let i = 0; i < 12; i++) {
      const obj = this.physics.add.sprite(
        positions[i].x,
        positions[i].y,
        'object'
      );
      obj.setBounce(0.4);
      obj.setCollideWorldBounds(true);
      this.objects.push(obj);
    }

    // 设置物体间碰撞
    this.physics.add.collider(this.player, this.objects);
    this.physics.add.collider(this.objects, this.objects);

    // 创建方向键输入
    this.cursors = this.input.keyboard.createCursorKeys();

    // 添加键盘事件监听（使用 just down 避免重复触发）
    this.input.keyboard.on('keydown-UP', () => this.switchGravity('up'));
    this.input.keyboard.on('keydown-DOWN', () => this.switchGravity('down'));
    this.input.keyboard.on('keydown-LEFT', () => this.switchGravity('left'));
    this.input.keyboard.on('keydown-RIGHT', () => this.switchGravity('right'));

    // 创建UI文本显示当前状态
    this.statusText = this.add.text(10, 10, '', {
      fontSize: '18px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
    this.updateStatusText();

    // 创建提示文本
    this.add.text(10, 560, 'Press Arrow Keys to Switch Gravity Direction', {
      fontSize: '16px',
      fill: '#ffff00'
    });
  }

  // 使用简单的伪随机数生成器确保确定性
  seededRandom(seed) {
    let value = seed;
    return function() {
      value = (value * 9301 + 49297) % 233280;
      return value / 233280;
    };
  }

  // 生成确定性的物体位置
  generatePositions(count, seed) {
    const random = this.seededRandom(seed);
    const positions = [];
    const margin = 50;
    
    for (let i = 0; i < count; i++) {
      positions.push({
        x: margin + random() * (800 - margin * 2),
        y: margin + random() * (600 - margin * 2)
      });
    }
    
    return positions;
  }

  // 切换重力方向
  switchGravity(direction) {
    if (this.gravityDirection === direction) {
      return; // 已经是当前方向，不重复切换
    }

    this.gravityDirection = direction;
    this.gravitySwitchCount++;

    const gravity = this.gravityMagnitude;

    switch (direction) {
      case 'up':
        this.physics.world.gravity.x = 0;
        this.physics.world.gravity.y = -gravity;
        break;
      case 'down':
        this.physics.world.gravity.x = 0;
        this.physics.world.gravity.y = gravity;
        break;
      case 'left':
        this.physics.world.gravity.x = -gravity;
        this.physics.world.gravity.y = 0;
        break;
      case 'right':
        this.physics.world.gravity.x = gravity;
        this.physics.world.gravity.y = 0;
        break;
    }

    this.updateStatusText();
  }

  // 更新状态文本
  updateStatusText() {
    const directionSymbols = {
      'up': '↑',
      'down': '↓',
      'left': '←',
      'right': '→'
    };

    this.statusText.setText([
      `Gravity Direction: ${directionSymbols[this.gravityDirection]} ${this.gravityDirection.toUpperCase()}`,
      `Switch Count: ${this.gravitySwitchCount}`,
      `Gravity: ${this.gravityMagnitude}`
    ]);
  }

  update(time, delta) {
    // 可以在这里添加额外的更新逻辑
    // 当前实现主要依赖物理引擎自动处理
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
      gravity: { x: 0, y: 300 }, // 初始重力向下
      debug: false
    }
  },
  scene: GravityScene
};

// 创建游戏实例
const game = new Phaser.Game(config);