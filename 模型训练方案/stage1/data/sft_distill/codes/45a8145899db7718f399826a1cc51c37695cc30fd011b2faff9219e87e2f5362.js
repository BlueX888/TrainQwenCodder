// 全局状态变量（用于验证）
let gravityDirection = 'DOWN'; // 'UP' 或 'DOWN'

class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.player = null;
    this.cursors = null;
    this.gravityText = null;
    this.currentGravity = 500; // 重力大小
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 创建玩家纹理（使用 Graphics）
    const graphics = this.add.graphics();
    graphics.fillStyle(0x00ff00, 1);
    graphics.fillCircle(16, 16, 16); // 绘制圆形玩家
    graphics.generateTexture('player', 32, 32);
    graphics.destroy();

    // 创建玩家精灵
    this.player = this.physics.add.sprite(400, 300, 'player');
    this.player.setBounce(0.3); // 添加弹跳效果
    this.player.setCollideWorldBounds(true); // 与世界边界碰撞

    // 创建地面和天花板（用于碰撞检测）
    this.createBoundaries();

    // 设置初始重力（向下）
    this.physics.world.gravity.y = this.currentGravity;
    this.physics.world.gravity.x = 0;

    // 创建键盘输入
    this.cursors = this.input.keyboard.createCursorKeys();

    // 创建重力方向显示文本
    this.gravityText = this.add.text(16, 16, 'Gravity: DOWN (500)', {
      fontSize: '24px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
    this.gravityText.setDepth(100);

    // 添加说明文本
    this.add.text(16, 560, 'Press UP/DOWN arrow to switch gravity', {
      fontSize: '18px',
      fill: '#ffff00',
      backgroundColor: '#000000',
      padding: { x: 8, y: 4 }
    });

    // 键盘事件监听
    this.input.keyboard.on('keydown-UP', () => {
      this.switchGravity('UP');
    });

    this.input.keyboard.on('keydown-DOWN', () => {
      this.switchGravity('DOWN');
    });
  }

  createBoundaries() {
    // 创建地面
    const ground = this.add.graphics();
    ground.fillStyle(0x8b4513, 1);
    ground.fillRect(0, 580, 800, 20);
    ground.generateTexture('ground', 800, 20);
    ground.destroy();

    const groundSprite = this.physics.add.staticSprite(400, 590, 'ground');

    // 创建天花板
    const ceiling = this.add.graphics();
    ceiling.fillStyle(0x4169e1, 1);
    ceiling.fillRect(0, 0, 800, 20);
    ceiling.generateTexture('ceiling', 800, 20);
    ceiling.destroy();

    const ceilingSprite = this.physics.add.staticSprite(400, 10, 'ceiling');

    // 添加碰撞检测
    this.physics.add.collider(this.player, groundSprite);
    this.physics.add.collider(this.player, ceilingSprite);
  }

  switchGravity(direction) {
    if (direction === 'UP') {
      // 重力向上（负值）
      this.physics.world.gravity.y = -this.currentGravity;
      gravityDirection = 'UP';
      this.gravityText.setText('Gravity: UP (-500)');
      this.gravityText.setStyle({ fill: '#00ffff' });
    } else if (direction === 'DOWN') {
      // 重力向下（正值）
      this.physics.world.gravity.y = this.currentGravity;
      gravityDirection = 'DOWN';
      this.gravityText.setText('Gravity: DOWN (500)');
      this.gravityText.setStyle({ fill: '#ffffff' });
    }

    // 给玩家一个初始速度，让重力效果更明显
    if (direction === 'UP') {
      this.player.setVelocityY(-100);
    } else {
      this.player.setVelocityY(100);
    }
  }

  update(time, delta) {
    // 添加左右移动控制（可选，增强交互性）
    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-200);
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(200);
    } else {
      this.player.setVelocityX(0);
    }

    // 限制玩家速度，防止过快
    const maxVelocity = 600;
    if (Math.abs(this.player.body.velocity.y) > maxVelocity) {
      this.player.setVelocityY(
        Math.sign(this.player.body.velocity.y) * maxVelocity
      );
    }

    // 更新状态显示（显示玩家位置作为调试信息）
    const posY = Math.round(this.player.y);
    const velY = Math.round(this.player.body.velocity.y);
    this.gravityText.setText(
      `Gravity: ${gravityDirection} (${gravityDirection === 'UP' ? '-' : ''}500)\nPos Y: ${posY} | Vel Y: ${velY}`
    );
  }
}

// Phaser 游戏配置
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#222222',
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 500 }, // 初始重力向下
      debug: false
    }
  },
  scene: GameScene
};

// 创建游戏实例
const game = new Phaser.Game(config);

// 导出状态变量供验证使用
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { game, gravityDirection };
}