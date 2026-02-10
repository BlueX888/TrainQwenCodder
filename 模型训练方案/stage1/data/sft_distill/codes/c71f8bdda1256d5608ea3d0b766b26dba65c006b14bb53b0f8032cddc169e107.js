class GravityScene extends Phaser.Scene {
  constructor() {
    super('GravityScene');
    this.gravityDirection = 'DOWN'; // 状态信号：当前重力方向
    this.gravityValue = 500;
  }

  preload() {
    // 无需加载外部资源
  }

  create() {
    const { width, height } = this.scale;

    // 创建玩家纹理（使用 Graphics）
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x00ff00, 1);
    playerGraphics.fillCircle(16, 16, 16);
    playerGraphics.generateTexture('player', 32, 32);
    playerGraphics.destroy();

    // 创建地板纹理
    const floorGraphics = this.add.graphics();
    floorGraphics.fillStyle(0x8b4513, 1);
    floorGraphics.fillRect(0, 0, width, 20);
    floorGraphics.generateTexture('floor', width, 20);
    floorGraphics.destroy();

    // 创建天花板纹理
    const ceilingGraphics = this.add.graphics();
    ceilingGraphics.fillStyle(0x4169e1, 1);
    ceilingGraphics.fillRect(0, 0, width, 20);
    ceilingGraphics.generateTexture('ceiling', width, 20);
    ceilingGraphics.destroy();

    // 创建物理玩家
    this.player = this.physics.add.sprite(width / 2, height / 2, 'player');
    this.player.setBounce(0.3);
    this.player.setCollideWorldBounds(true);

    // 创建地板和天花板
    this.floor = this.physics.add.staticSprite(width / 2, height - 10, 'floor');
    this.ceiling = this.physics.add.staticSprite(width / 2, 10, 'ceiling');

    // 添加碰撞
    this.physics.add.collider(this.player, this.floor);
    this.physics.add.collider(this.player, this.ceiling);

    // 设置初始重力（向下）
    this.physics.world.gravity.y = this.gravityValue;

    // 创建方向键输入
    this.cursors = this.input.keyboard.createCursorKeys();

    // 添加状态显示文本
    this.gravityText = this.add.text(16, 16, '', {
      fontSize: '24px',
      color: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
    this.updateGravityText();

    // 添加说明文本
    this.add.text(16, height - 60, 'Press UP/DOWN arrow keys\nto switch gravity direction', {
      fontSize: '18px',
      color: '#ffff00',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 添加键盘事件监听（防止连续触发）
    this.input.keyboard.on('keydown-UP', () => {
      this.setGravityDirection('UP');
    });

    this.input.keyboard.on('keydown-DOWN', () => {
      this.setGravityDirection('DOWN');
    });
  }

  update(time, delta) {
    // 根据重力方向调整玩家视觉效果（翻转）
    if (this.gravityDirection === 'UP') {
      this.player.setFlipY(true);
    } else {
      this.player.setFlipY(false);
    }

    // 限制玩家在屏幕内
    const { height } = this.scale;
    if (this.player.y < 30) {
      this.player.y = 30;
      this.player.setVelocityY(0);
    }
    if (this.player.y > height - 30) {
      this.player.y = height - 30;
      this.player.setVelocityY(0);
    }
  }

  setGravityDirection(direction) {
    if (this.gravityDirection === direction) {
      return; // 已经是该方向，不重复设置
    }

    this.gravityDirection = direction;

    if (direction === 'UP') {
      // 重力向上
      this.physics.world.gravity.y = -this.gravityValue;
    } else {
      // 重力向下
      this.physics.world.gravity.y = this.gravityValue;
    }

    // 更新显示文本
    this.updateGravityText();

    // 重置玩家速度，避免切换时的突变
    this.player.setVelocityY(0);
  }

  updateGravityText() {
    const arrow = this.gravityDirection === 'DOWN' ? '↓' : '↑';
    this.gravityText.setText(
      `Gravity Direction: ${this.gravityDirection} ${arrow}\n` +
      `Gravity Value: ${Math.abs(this.physics.world.gravity.y)}`
    );
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
      gravity: { y: 0 }, // 初始重力在 create 中设置
      debug: false
    }
  },
  scene: GravityScene
};

// 创建游戏实例
new Phaser.Game(config);