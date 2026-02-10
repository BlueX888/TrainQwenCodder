// 四向重力切换游戏
class GravityScene extends Phaser.Scene {
  constructor() {
    super('GravityScene');
    this.gravitySwitchCount = 0; // 状态验证信号
    this.currentDirection = 'down'; // 当前重力方向
    this.gravityMagnitude = 300; // 重力大小
  }

  preload() {
    // 使用固定随机种子确保行为确定性
    this.seed = 12345;
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

    // 创建20个物体
    this.objects = [];
    for (let i = 0; i < 20; i++) {
      // 使用确定性随机位置
      const x = this.seededRandom() * 700 + 50;
      const y = this.seededRandom() * 500 + 50;
      
      const obj = this.physics.add.sprite(x, y, 'object');
      obj.setCollideWorldBounds(true);
      obj.setBounce(0.4);
      this.objects.push(obj);
    }

    // 物体之间的碰撞
    this.physics.add.collider(this.player, this.objects);
    this.physics.add.collider(this.objects, this.objects);

    // 设置初始重力（向下）
    this.physics.world.gravity.set(0, this.gravityMagnitude);

    // 创建方向键输入
    this.cursors = this.input.keyboard.createCursorKeys();

    // 添加状态显示文本
    this.infoText = this.add.text(10, 10, '', {
      fontSize: '16px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
    this.updateInfoText();

    // 添加说明文本
    this.add.text(10, 560, 'Use Arrow Keys to switch gravity direction', {
      fontSize: '14px',
      fill: '#ffff00'
    });

    // 监听方向键按下事件（使用 justDown 避免重复触发）
    this.input.keyboard.on('keydown', (event) => {
      this.handleGravitySwitch(event.key);
    });
  }

  update(time, delta) {
    // 使用 justDown 检测单次按键
    if (Phaser.Input.Keyboard.JustDown(this.cursors.up)) {
      this.switchGravity('up');
    } else if (Phaser.Input.Keyboard.JustDown(this.cursors.down)) {
      this.switchGravity('down');
    } else if (Phaser.Input.Keyboard.JustDown(this.cursors.left)) {
      this.switchGravity('left');
    } else if (Phaser.Input.Keyboard.JustDown(this.cursors.right)) {
      this.switchGravity('right');
    }
  }

  handleGravitySwitch(key) {
    // 备用键盘输入处理（支持 WASD）
    switch(key) {
      case 'w':
      case 'W':
        this.switchGravity('up');
        break;
      case 's':
      case 'S':
        this.switchGravity('down');
        break;
      case 'a':
      case 'A':
        this.switchGravity('left');
        break;
      case 'd':
      case 'D':
        this.switchGravity('right');
        break;
    }
  }

  switchGravity(direction) {
    if (this.currentDirection === direction) {
      return; // 相同方向不切换
    }

    this.currentDirection = direction;
    this.gravitySwitchCount++;

    // 切换世界重力方向
    switch(direction) {
      case 'up':
        this.physics.world.gravity.set(0, -this.gravityMagnitude);
        break;
      case 'down':
        this.physics.world.gravity.set(0, this.gravityMagnitude);
        break;
      case 'left':
        this.physics.world.gravity.set(-this.gravityMagnitude, 0);
        break;
      case 'right':
        this.physics.world.gravity.set(this.gravityMagnitude, 0);
        break;
    }

    // 更新显示
    this.updateInfoText();

    // 添加视觉反馈：改变玩家颜色
    this.flashPlayer();
  }

  flashPlayer() {
    // 玩家闪烁效果表示重力切换
    this.player.setTint(0x00ff00);
    this.time.delayedCall(200, () => {
      this.player.clearTint();
    });
  }

  updateInfoText() {
    const directionSymbol = {
      'up': '↑',
      'down': '↓',
      'left': '←',
      'right': '→'
    };

    this.infoText.setText([
      `Gravity Direction: ${directionSymbol[this.currentDirection]} ${this.currentDirection.toUpperCase()}`,
      `Switch Count: ${this.gravitySwitchCount}`,
      `Gravity: (${this.physics.world.gravity.x}, ${this.physics.world.gravity.y})`,
      `Objects: ${this.objects.length + 1}` // +1 for player
    ]);
  }

  // 确定性随机数生成器（LCG算法）
  seededRandom() {
    this.seed = (this.seed * 9301 + 49297) % 233280;
    return this.seed / 233280;
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
      gravity: { y: 300 }, // 初始重力向下
      debug: false
    }
  },
  scene: GravityScene
};

// 启动游戏
const game = new Phaser.Game(config);