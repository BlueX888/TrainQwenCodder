// Phaser3 重力方向切换游戏
class GravityGameScene extends Phaser.Scene {
  constructor() {
    super('GravityGameScene');
    this.gravityDirection = 'DOWN'; // 初始重力方向
    this.gravityValue = 400; // 重力大小
  }

  preload() {
    // 不需要外部资源
  }

  create() {
    // 初始化信号记录
    window.__signals__ = {
      gravityChanges: [],
      playerPositions: [],
      currentGravity: 'DOWN',
      frameCount: 0
    };

    // 创建玩家纹理（蓝色方块）
    const graphics = this.add.graphics();
    graphics.fillStyle(0x00aaff, 1);
    graphics.fillRect(0, 0, 40, 40);
    graphics.generateTexture('player', 40, 40);
    graphics.destroy();

    // 创建地面纹理（绿色）
    const groundGraphics = this.add.graphics();
    groundGraphics.fillStyle(0x00ff00, 1);
    groundGraphics.fillRect(0, 0, 800, 50);
    groundGraphics.generateTexture('ground', 800, 50);
    groundGraphics.destroy();

    // 创建天花板纹理（红色）
    const ceilingGraphics = this.add.graphics();
    ceilingGraphics.fillStyle(0xff0000, 1);
    ceilingGraphics.fillRect(0, 0, 800, 50);
    ceilingGraphics.generateTexture('ceiling', 800, 50);
    ceilingGraphics.destroy();

    // 设置初始世界重力（向下）
    this.physics.world.gravity.y = this.gravityValue;

    // 创建玩家精灵
    this.player = this.physics.add.sprite(400, 300, 'player');
    this.player.setBounce(0.3);
    this.player.setCollideWorldBounds(true);

    // 创建地面
    this.ground = this.physics.add.staticSprite(400, 575, 'ground');
    this.ground.setDisplaySize(800, 50);
    this.ground.refreshBody();

    // 创建天花板
    this.ceiling = this.physics.add.staticSprite(400, 25, 'ceiling');
    this.ceiling.setDisplaySize(800, 50);
    this.ceiling.refreshBody();

    // 添加碰撞
    this.physics.add.collider(this.player, this.ground);
    this.physics.add.collider(this.player, this.ceiling);

    // 创建键盘输入
    this.cursors = this.input.keyboard.createCursorKeys();

    // 显示重力方向文本
    this.gravityText = this.add.text(16, 16, '', {
      fontSize: '24px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
    this.updateGravityText();

    // 显示操作提示
    this.add.text(16, 60, '↑ 键: 重力向上\n↓ 键: 重力向下', {
      fontSize: '18px',
      fill: '#ffff00',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 显示玩家位置
    this.positionText = this.add.text(16, 120, '', {
      fontSize: '18px',
      fill: '#00ffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 记录初始状态
    this.logGravityChange('DOWN', 0);
  }

  update(time, delta) {
    window.__signals__.frameCount++;

    // 检测上方向键 - 重力向上
    if (Phaser.Input.Keyboard.JustDown(this.cursors.up)) {
      this.setGravityDirection('UP');
    }

    // 检测下方向键 - 重力向下
    if (Phaser.Input.Keyboard.JustDown(this.cursors.down)) {
      this.setGravityDirection('DOWN');
    }

    // 更新位置显示
    this.positionText.setText(
      `玩家位置: (${Math.round(this.player.x)}, ${Math.round(this.player.y)})\n` +
      `速度: (${Math.round(this.player.body.velocity.x)}, ${Math.round(this.player.body.velocity.y)})`
    );

    // 每30帧记录一次玩家位置
    if (window.__signals__.frameCount % 30 === 0) {
      window.__signals__.playerPositions.push({
        frame: window.__signals__.frameCount,
        x: Math.round(this.player.x),
        y: Math.round(this.player.y),
        velocityY: Math.round(this.player.body.velocity.y)
      });
    }
  }

  setGravityDirection(direction) {
    if (this.gravityDirection === direction) {
      return; // 已经是当前方向，不重复设置
    }

    this.gravityDirection = direction;

    if (direction === 'UP') {
      // 重力向上
      this.physics.world.gravity.y = -this.gravityValue;
    } else {
      // 重力向下
      this.physics.world.gravity.y = this.gravityValue;
    }

    this.updateGravityText();
    this.logGravityChange(direction, window.__signals__.frameCount);

    // 给玩家一个初始速度，让效果更明显
    if (direction === 'UP') {
      this.player.setVelocityY(-100);
    } else {
      this.player.setVelocityY(100);
    }
  }

  updateGravityText() {
    const arrow = this.gravityDirection === 'UP' ? '↑' : '↓';
    this.gravityText.setText(
      `重力方向: ${this.gravityDirection} ${arrow}\n` +
      `重力值: ${this.gravityDirection === 'UP' ? '-' : '+'}${this.gravityValue}`
    );
  }

  logGravityChange(direction, frame) {
    const changeEvent = {
      frame: frame,
      direction: direction,
      gravityY: this.physics.world.gravity.y,
      timestamp: Date.now(),
      playerY: Math.round(this.player.y)
    };

    window.__signals__.gravityChanges.push(changeEvent);
    window.__signals__.currentGravity = direction;

    console.log('[GRAVITY_CHANGE]', JSON.stringify(changeEvent));
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
      gravity: { y: 0 }, // 在 create 中设置
      debug: false
    }
  },
  scene: GravityGameScene
};

// 启动游戏
const game = new Phaser.Game(config);

// 导出验证函数
window.getGameState = function() {
  return {
    signals: window.__signals__,
    summary: {
      totalGravityChanges: window.__signals__.gravityChanges.length,
      currentGravity: window.__signals__.currentGravity,
      totalFrames: window.__signals__.frameCount,
      positionSamples: window.__signals__.playerPositions.length
    }
  };
};

// 控制台输出游戏状态
console.log('[GAME_INIT] Gravity game initialized. Use ↑/↓ keys to change gravity direction.');
console.log('[GAME_INIT] Call window.getGameState() to view current state.');