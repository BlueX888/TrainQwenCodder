// 四向重力切换游戏
class GravityScene extends Phaser.Scene {
  constructor() {
    super('GravityScene');
    this.gravitySwitchCount = 0; // 状态信号：重力切换次数
    this.currentGravityDirection = 'down'; // 当前重力方向
    this.gravityMagnitude = 300; // 重力大小
    this.seed = 12345; // 固定随机种子
  }

  preload() {
    // 使用固定种子的随机数生成器
    this.rng = this.createSeededRandom(this.seed);
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

    // 创建玩家（物理精灵）
    this.player = this.physics.add.sprite(400, 100, 'player');
    this.player.setBounce(0.3);
    this.player.setCollideWorldBounds(true);

    // 创建12个物体
    this.objects = [];
    for (let i = 0; i < 12; i++) {
      const x = this.seededRandom(100, 700);
      const y = this.seededRandom(100, 500);
      const obj = this.physics.add.sprite(x, y, 'object');
      obj.setBounce(0.4);
      obj.setCollideWorldBounds(true);
      this.objects.push(obj);
    }

    // 设置物体之间的碰撞
    this.physics.add.collider(this.player, this.objects);
    this.physics.add.collider(this.objects, this.objects);

    // 创建方向键输入
    this.cursors = this.input.keyboard.createCursorKeys();

    // 添加额外的WASD键支持
    this.keys = this.input.keyboard.addKeys({
      up: Phaser.Input.Keyboard.KeyCodes.UP,
      down: Phaser.Input.Keyboard.KeyCodes.DOWN,
      left: Phaser.Input.Keyboard.KeyCodes.LEFT,
      right: Phaser.Input.Keyboard.KeyCodes.RIGHT,
      w: Phaser.Input.Keyboard.KeyCodes.W,
      s: Phaser.Input.Keyboard.KeyCodes.S,
      a: Phaser.Input.Keyboard.KeyCodes.A,
      d: Phaser.Input.Keyboard.KeyCodes.D
    });

    // 防止按键重复触发
    this.lastKeyPressTime = 0;
    this.keyPressDelay = 200; // 毫秒

    // 创建UI文本显示
    this.infoText = this.add.text(10, 10, '', {
      fontSize: '18px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 创建重力方向指示器
    this.gravityIndicator = this.add.graphics();

    // 初始化重力（向下）
    this.setGravity('down');

    // 更新显示
    this.updateInfo();
  }

  update(time, delta) {
    const currentTime = time;

    // 检测方向键按下并切换重力
    if (currentTime - this.lastKeyPressTime > this.keyPressDelay) {
      if (this.cursors.up.isDown || this.keys.w.isDown) {
        this.setGravity('up');
        this.lastKeyPressTime = currentTime;
      } else if (this.cursors.down.isDown || this.keys.s.isDown) {
        this.setGravity('down');
        this.lastKeyPressTime = currentTime;
      } else if (this.cursors.left.isDown || this.keys.a.isDown) {
        this.setGravity('left');
        this.lastKeyPressTime = currentTime;
      } else if (this.cursors.right.isDown || this.keys.d.isDown) {
        this.setGravity('right');
        this.lastKeyPressTime = currentTime;
      }
    }

    // 更新重力指示器
    this.drawGravityIndicator();
  }

  setGravity(direction) {
    if (this.currentGravityDirection === direction) {
      return; // 相同方向不重复设置
    }

    this.currentGravityDirection = direction;
    this.gravitySwitchCount++;

    // 重置世界重力
    const gravity = this.physics.world.gravity;

    switch (direction) {
      case 'up':
        gravity.x = 0;
        gravity.y = -this.gravityMagnitude;
        break;
      case 'down':
        gravity.x = 0;
        gravity.y = this.gravityMagnitude;
        break;
      case 'left':
        gravity.x = -this.gravityMagnitude;
        gravity.y = 0;
        break;
      case 'right':
        gravity.x = this.gravityMagnitude;
        gravity.y = 0;
        break;
    }

    this.updateInfo();
  }

  updateInfo() {
    const directionMap = {
      up: '↑ 上',
      down: '↓ 下',
      left: '← 左',
      right: '→ 右'
    };

    this.infoText.setText([
      `重力方向: ${directionMap[this.currentGravityDirection]}`,
      `重力大小: ${this.gravityMagnitude}`,
      `切换次数: ${this.gravitySwitchCount}`,
      `物体数量: ${this.objects.length + 1}`,
      '',
      '操作: 方向键/WASD 切换重力'
    ]);
  }

  drawGravityIndicator() {
    this.gravityIndicator.clear();
    
    const centerX = 750;
    const centerY = 50;
    const arrowLength = 30;

    // 绘制圆形背景
    this.gravityIndicator.fillStyle(0x333333, 0.8);
    this.gravityIndicator.fillCircle(centerX, centerY, 25);

    // 绘制箭头
    this.gravityIndicator.lineStyle(4, 0x00ff00, 1);
    this.gravityIndicator.fillStyle(0x00ff00, 1);

    let endX = centerX;
    let endY = centerY;

    switch (this.currentGravityDirection) {
      case 'up':
        endY = centerY - arrowLength;
        break;
      case 'down':
        endY = centerY + arrowLength;
        break;
      case 'left':
        endX = centerX - arrowLength;
        break;
      case 'right':
        endX = centerX + arrowLength;
        break;
    }

    // 绘制箭头线
    this.gravityIndicator.beginPath();
    this.gravityIndicator.moveTo(centerX, centerY);
    this.gravityIndicator.lineTo(endX, endY);
    this.gravityIndicator.strokePath();

    // 绘制箭头头部
    const angle = Math.atan2(endY - centerY, endX - centerX);
    const arrowHeadLength = 10;
    
    this.gravityIndicator.beginPath();
    this.gravityIndicator.moveTo(endX, endY);
    this.gravityIndicator.lineTo(
      endX - arrowHeadLength * Math.cos(angle - Math.PI / 6),
      endY - arrowHeadLength * Math.sin(angle - Math.PI / 6)
    );
    this.gravityIndicator.lineTo(
      endX - arrowHeadLength * Math.cos(angle + Math.PI / 6),
      endY - arrowHeadLength * Math.sin(angle + Math.PI / 6)
    );
    this.gravityIndicator.closePath();
    this.gravityIndicator.fillPath();
  }

  // 创建基于种子的随机数生成器
  createSeededRandom(seed) {
    return {
      seed: seed,
      next: function() {
        this.seed = (this.seed * 9301 + 49297) % 233280;
        return this.seed / 233280;
      }
    };
  }

  // 生成指定范围的随机数
  seededRandom(min, max) {
    return min + this.rng.next() * (max - min);
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
      gravity: { x: 0, y: 300 }, // 初始重力向下
      debug: false
    }
  },
  scene: GravityScene
};

// 创建游戏实例
const game = new Phaser.Game(config);