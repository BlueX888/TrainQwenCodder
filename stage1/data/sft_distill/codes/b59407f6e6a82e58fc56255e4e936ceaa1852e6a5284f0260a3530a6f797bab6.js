// 循环地图效果 - 玩家移出边界从对侧出现
class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.player = null;
    this.cursors = null;
    this.positionText = null;
    // 状态信号
    this.wrapCount = 0; // 记录穿越边界次数
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 创建灰色玩家纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0x808080, 1); // 灰色
    graphics.fillRect(0, 0, 40, 40);
    graphics.generateTexture('playerTex', 40, 40);
    graphics.destroy();

    // 创建物理精灵（玩家）
    this.player = this.physics.add.sprite(400, 300, 'playerTex');
    this.player.setCollideWorldBounds(false); // 允许移出边界
    this.player.setDrag(0); // 无拖拽，保持速度

    // 设置键盘输入
    this.cursors = this.input.keyboard.createCursorKeys();

    // 显示信息文本
    this.positionText = this.add.text(10, 10, '', {
      fontSize: '18px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 添加边界提示
    const bounds = this.add.graphics();
    bounds.lineStyle(2, 0x00ff00, 0.5);
    bounds.strokeRect(0, 0, 800, 600);

    // 添加说明文字
    this.add.text(400, 30, '使用方向键移动，速度300', {
      fontSize: '16px',
      fill: '#ffff00'
    }).setOrigin(0.5);

    this.add.text(400, 55, '移出边界将从对侧出现', {
      fontSize: '16px',
      fill: '#ffff00'
    }).setOrigin(0.5);
  }

  update(time, delta) {
    // 重置速度
    this.player.setVelocity(0);

    // 处理键盘输入
    const speed = 300;

    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-speed);
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(speed);
    }

    if (this.cursors.up.isDown) {
      this.player.setVelocityY(-speed);
    } else if (this.cursors.down.isDown) {
      this.player.setVelocityY(speed);
    }

    // 对角线移动时归一化速度
    if (this.player.body.velocity.x !== 0 && this.player.body.velocity.y !== 0) {
      const normalized = this.player.body.velocity.normalize().scale(speed);
      this.player.setVelocity(normalized.x, normalized.y);
    }

    // 循环地图效果 - 边界检测与传送
    const playerWidth = this.player.width;
    const playerHeight = this.player.height;

    // 左边界
    if (this.player.x < -playerWidth / 2) {
      this.player.x = this.cameras.main.width + playerWidth / 2;
      this.wrapCount++;
    }
    // 右边界
    else if (this.player.x > this.cameras.main.width + playerWidth / 2) {
      this.player.x = -playerWidth / 2;
      this.wrapCount++;
    }

    // 上边界
    if (this.player.y < -playerHeight / 2) {
      this.player.y = this.cameras.main.height + playerHeight / 2;
      this.wrapCount++;
    }
    // 下边界
    else if (this.player.y > this.cameras.main.height + playerHeight / 2) {
      this.player.y = -playerHeight / 2;
      this.wrapCount++;
    }

    // 更新显示信息
    this.positionText.setText([
      `位置: (${Math.round(this.player.x)}, ${Math.round(this.player.y)})`,
      `速度: (${Math.round(this.player.body.velocity.x)}, ${Math.round(this.player.body.velocity.y)})`,
      `穿越次数: ${this.wrapCount}`
    ]);
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
      gravity: { y: 0 }, // 无重力
      debug: false
    }
  },
  scene: GameScene
};

// 启动游戏
new Phaser.Game(config);