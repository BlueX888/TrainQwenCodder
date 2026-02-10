class GravityFlipScene extends Phaser.Scene {
  constructor() {
    super('GravityFlipScene');
    this.gravityDirection = 'DOWN'; // 状态信号：当前重力方向
    this.flipCount = 0; // 状态信号：切换次数
  }

  preload() {
    // 使用 Graphics 创建纹理，无需外部资源
  }

  create() {
    const { width, height } = this.cameras.main;

    // 创建玩家纹理
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x00ff00, 1);
    playerGraphics.fillCircle(16, 16, 16);
    playerGraphics.generateTexture('player', 32, 32);
    playerGraphics.destroy();

    // 创建地面纹理
    const groundGraphics = this.add.graphics();
    groundGraphics.fillStyle(0x8b4513, 1);
    groundGraphics.fillRect(0, 0, width, 40);
    groundGraphics.generateTexture('ground', width, 40);
    groundGraphics.destroy();

    // 创建天花板纹理
    const ceilingGraphics = this.add.graphics();
    ceilingGraphics.fillStyle(0x4169e1, 1);
    ceilingGraphics.fillRect(0, 0, width, 40);
    ceilingGraphics.generateTexture('ceiling', width, 40);
    ceilingGraphics.destroy();

    // 创建玩家
    this.player = this.physics.add.sprite(width / 2, height / 2, 'player');
    this.player.setBounce(0.2);
    this.player.setCollideWorldBounds(true);

    // 创建地面（底部）
    this.ground = this.physics.add.staticSprite(width / 2, height - 20, 'ground');
    this.ground.refreshBody();

    // 创建天花板（顶部）
    this.ceiling = this.physics.add.staticSprite(width / 2, 20, 'ceiling');
    this.ceiling.refreshBody();

    // 添加碰撞检测
    this.physics.add.collider(this.player, this.ground);
    this.physics.add.collider(this.player, this.ceiling);

    // 设置初始重力（向下）
    this.physics.world.gravity.y = 600;

    // 创建空格键监听
    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

    // 显示重力方向文本
    this.gravityText = this.add.text(20, 20, '', {
      fontSize: '24px',
      color: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
    this.gravityText.setDepth(100);

    // 显示切换次数文本
    this.flipCountText = this.add.text(20, 60, '', {
      fontSize: '18px',
      color: '#ffff00',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
    this.flipCountText.setDepth(100);

    // 显示说明文本
    this.add.text(width / 2, height - 60, 'Press SPACE to flip gravity', {
      fontSize: '20px',
      color: '#ffffff',
      backgroundColor: '#333333',
      padding: { x: 15, y: 8 }
    }).setOrigin(0.5);

    // 更新显示
    this.updateGravityDisplay();

    // 空格键按下事件（使用 JustDown 避免连续触发）
    this.spaceKey.on('down', () => {
      this.flipGravity();
    });
  }

  flipGravity() {
    // 切换重力方向
    if (this.gravityDirection === 'DOWN') {
      this.physics.world.gravity.y = -600;
      this.gravityDirection = 'UP';
    } else {
      this.physics.world.gravity.y = 600;
      this.gravityDirection = 'DOWN';
    }

    // 增加切换计数
    this.flipCount++;

    // 更新显示
    this.updateGravityDisplay();

    // 视觉反馈：玩家闪烁
    this.tweens.add({
      targets: this.player,
      alpha: 0.3,
      duration: 100,
      yoyo: true,
      repeat: 1
    });
  }

  updateGravityDisplay() {
    const arrow = this.gravityDirection === 'DOWN' ? '↓' : '↑';
    const color = this.gravityDirection === 'DOWN' ? '#ff0000' : '#00ffff';
    
    this.gravityText.setText(`Gravity: ${arrow} ${this.gravityDirection}`);
    this.gravityText.setColor(color);
    
    this.flipCountText.setText(`Flips: ${this.flipCount}`);
  }

  update(time, delta) {
    // 检测空格键状态（备用方式，已使用事件监听）
    // 这里可以添加额外的游戏逻辑

    // 限制玩家速度，防止过快
    const maxVelocity = 800;
    if (Math.abs(this.player.body.velocity.y) > maxVelocity) {
      this.player.body.velocity.y = Math.sign(this.player.body.velocity.y) * maxVelocity;
    }

    // 可选：添加水平移动控制
    const cursors = this.input.keyboard.createCursorKeys();
    if (cursors.left.isDown) {
      this.player.setVelocityX(-200);
    } else if (cursors.right.isDown) {
      this.player.setVelocityX(200);
    } else {
      this.player.setVelocityX(0);
    }
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
      gravity: { y: 600 },
      debug: false
    }
  },
  scene: GravityFlipScene
};

// 创建游戏实例
const game = new Phaser.Game(config);