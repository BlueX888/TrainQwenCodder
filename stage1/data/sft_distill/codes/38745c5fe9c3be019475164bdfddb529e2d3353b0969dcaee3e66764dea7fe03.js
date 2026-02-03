class GravityScene extends Phaser.Scene {
  constructor() {
    super('GravityScene');
    this.gravityDirection = 'DOWN'; // 状态信号：当前重力方向
    this.gravityMagnitude = 400;
  }

  preload() {
    // 使用Graphics创建玩家纹理，无需外部资源
  }

  create() {
    // 创建玩家纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0x00ff00, 1);
    graphics.fillCircle(16, 16, 16);
    graphics.generateTexture('player', 32, 32);
    graphics.destroy();

    // 创建玩家精灵（物理对象）
    this.player = this.physics.add.sprite(400, 300, 'player');
    this.player.setBounce(0.3);
    this.player.setCollideWorldBounds(true);

    // 初始重力向下
    this.physics.world.gravity.y = this.gravityMagnitude;
    this.physics.world.gravity.x = 0;

    // 创建键盘输入
    this.keyW = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
    this.keyA = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
    this.keyS = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
    this.keyD = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);

    // 显示当前重力方向的文本
    this.gravityText = this.add.text(16, 16, 'Gravity: DOWN', {
      fontSize: '24px',
      color: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
    this.gravityText.setScrollFactor(0);

    // 添加说明文本
    this.add.text(16, 60, 'Press W/A/S/D to change gravity direction', {
      fontSize: '16px',
      color: '#cccccc',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 绘制场景边界参考线
    const bounds = this.add.graphics();
    bounds.lineStyle(2, 0xffffff, 0.3);
    bounds.strokeRect(0, 0, 800, 600);
  }

  update(time, delta) {
    // 检测W键 - 重力向上
    if (Phaser.Input.Keyboard.JustDown(this.keyW)) {
      this.setGravity(0, -this.gravityMagnitude, 'UP');
    }

    // 检测S键 - 重力向下
    if (Phaser.Input.Keyboard.JustDown(this.keyS)) {
      this.setGravity(0, this.gravityMagnitude, 'DOWN');
    }

    // 检测A键 - 重力向左
    if (Phaser.Input.Keyboard.JustDown(this.keyA)) {
      this.setGravity(-this.gravityMagnitude, 0, 'LEFT');
    }

    // 检测D键 - 重力向右
    if (Phaser.Input.Keyboard.JustDown(this.keyD)) {
      this.setGravity(this.gravityMagnitude, 0, 'RIGHT');
    }

    // 限制玩家速度，避免过快
    const maxVelocity = 500;
    if (Math.abs(this.player.body.velocity.x) > maxVelocity) {
      this.player.body.velocity.x = Math.sign(this.player.body.velocity.x) * maxVelocity;
    }
    if (Math.abs(this.player.body.velocity.y) > maxVelocity) {
      this.player.body.velocity.y = Math.sign(this.player.body.velocity.y) * maxVelocity;
    }
  }

  setGravity(x, y, direction) {
    // 设置世界重力
    this.physics.world.gravity.x = x;
    this.physics.world.gravity.y = y;
    
    // 更新状态信号
    this.gravityDirection = direction;
    
    // 更新显示文本
    this.gravityText.setText(`Gravity: ${direction}`);
    
    // 重置玩家速度，使重力切换更明显
    this.player.setVelocity(0, 0);
    
    // 添加视觉反馈 - 文本闪烁效果
    this.gravityText.setScale(1.2);
    this.tweens.add({
      targets: this.gravityText,
      scaleX: 1,
      scaleY: 1,
      duration: 200,
      ease: 'Back.easeOut'
    });

    // 控制台输出状态，便于验证
    console.log(`Gravity changed to ${direction}: (${x}, ${y})`);
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
      gravity: { x: 0, y: 400 },
      debug: false
    }
  },
  scene: GravityScene
};

const game = new Phaser.Game(config);