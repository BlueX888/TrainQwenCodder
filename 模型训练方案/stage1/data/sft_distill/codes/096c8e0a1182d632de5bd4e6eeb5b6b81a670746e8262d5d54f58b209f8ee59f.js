class GravityScene extends Phaser.Scene {
  constructor() {
    super('GravityScene');
    this.gravityDirection = 'down'; // 状态信号：当前重力方向
    this.gravityMagnitude = 300;
    this.switchCount = 0; // 状态信号：切换次数
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 生成玩家纹理（蓝色方块）
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x0088ff, 1);
    playerGraphics.fillRect(0, 0, 40, 40);
    playerGraphics.generateTexture('player', 40, 40);
    playerGraphics.destroy();

    // 生成物体纹理（红色圆形）
    const objectGraphics = this.add.graphics();
    objectGraphics.fillStyle(0xff4444, 1);
    objectGraphics.fillCircle(15, 15, 15);
    objectGraphics.generateTexture('object', 30, 30);
    objectGraphics.destroy();

    // 创建玩家
    this.player = this.physics.add.sprite(400, 100, 'player');
    this.player.setCollideWorldBounds(true);
    this.player.setBounce(0.3);

    // 创建 10 个物体（使用固定种子确保位置确定）
    this.objects = this.physics.add.group();
    const seed = 12345;
    let rng = seed;
    
    for (let i = 0; i < 10; i++) {
      // 简单的伪随机数生成器（确保确定性）
      rng = (rng * 9301 + 49297) % 233280;
      const x = 100 + (rng / 233280) * 600;
      
      rng = (rng * 9301 + 49297) % 233280;
      const y = 100 + (rng / 233280) * 400;
      
      const obj = this.objects.create(x, y, 'object');
      obj.setCollideWorldBounds(true);
      obj.setBounce(0.5);
    }

    // 物体之间的碰撞
    this.physics.add.collider(this.objects, this.objects);
    this.physics.add.collider(this.player, this.objects);

    // 创建方向键输入
    this.cursors = this.input.keyboard.createCursorKeys();

    // 添加键盘监听（用于切换重力）
    this.input.keyboard.on('keydown', (event) => {
      this.handleGravitySwitch(event.key);
    });

    // 添加文本显示当前状态
    this.infoText = this.add.text(10, 10, '', {
      fontSize: '18px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
    this.updateInfoText();

    // 添加提示文本
    this.add.text(10, 560, 'Use Arrow Keys to switch gravity direction', {
      fontSize: '16px',
      fill: '#ffff00'
    });
  }

  handleGravitySwitch(key) {
    let newDirection = null;
    let gravityX = 0;
    let gravityY = 0;

    switch(key) {
      case 'ArrowUp':
        newDirection = 'up';
        gravityY = -this.gravityMagnitude;
        break;
      case 'ArrowDown':
        newDirection = 'down';
        gravityY = this.gravityMagnitude;
        break;
      case 'ArrowLeft':
        newDirection = 'left';
        gravityX = -this.gravityMagnitude;
        break;
      case 'ArrowRight':
        newDirection = 'right';
        gravityX = this.gravityMagnitude;
        break;
    }

    if (newDirection && newDirection !== this.gravityDirection) {
      // 切换重力方向
      this.physics.world.gravity.x = gravityX;
      this.physics.world.gravity.y = gravityY;
      
      this.gravityDirection = newDirection;
      this.switchCount++;
      this.updateInfoText();

      // 视觉反馈：闪烁效果
      this.cameras.main.flash(100, 255, 255, 255, false);
    }
  }

  updateInfoText() {
    const directionMap = {
      'up': '↑ UP',
      'down': '↓ DOWN',
      'left': '← LEFT',
      'right': '→ RIGHT'
    };

    this.infoText.setText([
      `Gravity Direction: ${directionMap[this.gravityDirection]}`,
      `Switch Count: ${this.switchCount}`,
      `Gravity: (${this.physics.world.gravity.x}, ${this.physics.world.gravity.y})`
    ]);
  }

  update(time, delta) {
    // 可以添加额外的更新逻辑
    // 当前实现中重力切换通过事件处理，不需要每帧检测
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

const game = new Phaser.Game(config);