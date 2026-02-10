// 四向重力切换游戏
class GravityGame extends Phaser.Scene {
  constructor() {
    super('GravityGame');
    this.gravityDirection = 'down'; // down, up, left, right
    this.gravitySwitchCount = 0;
    this.seed = 12345; // 固定随机种子
  }

  preload() {
    // 使用 Graphics 创建纹理，无需外部资源
  }

  create() {
    // 初始化信号对象
    window.__signals__ = {
      gravityDirection: 'down',
      gravitySwitchCount: 0,
      playerPosition: { x: 0, y: 0 },
      objectsCount: 12,
      timestamp: Date.now()
    };

    // 创建玩家纹理（蓝色方块）
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x0066ff, 1);
    playerGraphics.fillRect(0, 0, 40, 40);
    playerGraphics.generateTexture('player', 40, 40);
    playerGraphics.destroy();

    // 创建物体纹理（红色圆形）
    const objectGraphics = this.add.graphics();
    objectGraphics.fillStyle(0xff3333, 1);
    objectGraphics.fillCircle(15, 15, 15);
    objectGraphics.generateTexture('object', 30, 30);
    objectGraphics.destroy();

    // 创建玩家精灵
    this.player = this.physics.add.sprite(400, 100, 'player');
    this.player.setCollideWorldBounds(true);
    this.player.setBounce(0.3);
    this.player.setDamping(true);
    this.player.setDrag(0.95);

    // 创建 12 个物理物体
    this.objects = [];
    const random = this.createSeededRandom(this.seed);
    
    for (let i = 0; i < 12; i++) {
      const x = 100 + (random() * 600);
      const y = 100 + (random() * 400);
      const obj = this.physics.add.sprite(x, y, 'object');
      obj.setCollideWorldBounds(true);
      obj.setBounce(0.4);
      obj.setDamping(true);
      obj.setDrag(0.9);
      this.objects.push(obj);
    }

    // 设置物体之间的碰撞
    this.physics.add.collider(this.player, this.objects);
    this.physics.add.collider(this.objects, this.objects);

    // 设置初始重力（向下）
    this.physics.world.gravity.y = 200;
    this.physics.world.gravity.x = 0;

    // 创建键盘输入
    this.cursors = this.input.keyboard.createCursorKeys();

    // 添加方向指示文本
    this.directionText = this.add.text(16, 16, 'Gravity: DOWN\nSwitches: 0', {
      fontSize: '20px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 添加说明文本
    this.add.text(16, 560, 'Use Arrow Keys to switch gravity direction', {
      fontSize: '16px',
      fill: '#ffff00',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 键盘事件监听
    this.input.keyboard.on('keydown-UP', () => this.switchGravity('up'));
    this.input.keyboard.on('keydown-DOWN', () => this.switchGravity('down'));
    this.input.keyboard.on('keydown-LEFT', () => this.switchGravity('left'));
    this.input.keyboard.on('keydown-RIGHT', () => this.switchGravity('right'));

    console.log('[Game Started] Initial gravity: DOWN, Objects: 12');
  }

  switchGravity(direction) {
    // 避免重复切换到相同方向
    if (this.gravityDirection === direction) {
      return;
    }

    this.gravityDirection = direction;
    this.gravitySwitchCount++;

    // 重置重力
    this.physics.world.gravity.x = 0;
    this.physics.world.gravity.y = 0;

    // 设置新的重力方向
    switch (direction) {
      case 'up':
        this.physics.world.gravity.y = -200;
        break;
      case 'down':
        this.physics.world.gravity.y = 200;
        break;
      case 'left':
        this.physics.world.gravity.x = -200;
        break;
      case 'right':
        this.physics.world.gravity.x = 200;
        break;
    }

    // 更新显示
    this.directionText.setText(
      `Gravity: ${direction.toUpperCase()}\nSwitches: ${this.gravitySwitchCount}`
    );

    // 更新信号
    window.__signals__.gravityDirection = direction;
    window.__signals__.gravitySwitchCount = this.gravitySwitchCount;
    window.__signals__.timestamp = Date.now();

    // 输出日志
    console.log(JSON.stringify({
      event: 'gravity_switch',
      direction: direction,
      count: this.gravitySwitchCount,
      gravity: {
        x: this.physics.world.gravity.x,
        y: this.physics.world.gravity.y
      }
    }));
  }

  update(time, delta) {
    // 更新玩家位置信号
    window.__signals__.playerPosition = {
      x: Math.round(this.player.x),
      y: Math.round(this.player.y)
    };

    // 每秒输出一次状态（用于验证）
    if (!this.lastLogTime || time - this.lastLogTime > 1000) {
      this.lastLogTime = time;
      
      const objectPositions = this.objects.map((obj, i) => ({
        id: i,
        x: Math.round(obj.x),
        y: Math.round(obj.y),
        vx: Math.round(obj.body.velocity.x),
        vy: Math.round(obj.body.velocity.y)
      }));

      console.log(JSON.stringify({
        event: 'state_update',
        time: Math.round(time),
        gravityDirection: this.gravityDirection,
        switchCount: this.gravitySwitchCount,
        player: {
          x: Math.round(this.player.x),
          y: Math.round(this.player.y),
          vx: Math.round(this.player.body.velocity.x),
          vy: Math.round(this.player.body.velocity.y)
        },
        objectsCount: this.objects.length
      }));
    }
  }

  // 创建可重现的随机数生成器
  createSeededRandom(seed) {
    let state = seed;
    return function() {
      state = (state * 9301 + 49297) % 233280;
      return state / 233280;
    };
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
      gravity: { y: 200 },
      debug: false
    }
  },
  scene: GravityGame
};

// 启动游戏
const game = new Phaser.Game(config);