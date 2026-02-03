// 完整的 Phaser3 平台跳跃游戏
class PlatformScene extends Phaser.Scene {
  constructor() {
    super('PlatformScene');
    // 可验证的状态信号
    this.jumpCount = 0;
    this.playerX = 0;
    this.playerY = 0;
    this.isOnGround = false;
  }

  preload() {
    // 使用 Graphics 创建纹理，无需外部资源
    this.createTextures();
  }

  createTextures() {
    // 创建玩家纹理（蓝色方块）
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x3498db, 1);
    playerGraphics.fillRect(0, 0, 32, 48);
    playerGraphics.generateTexture('player', 32, 48);
    playerGraphics.destroy();

    // 创建地面纹理（绿色平台）
    const groundGraphics = this.add.graphics();
    groundGraphics.fillStyle(0x27ae60, 1);
    groundGraphics.fillRect(0, 0, 200, 32);
    groundGraphics.generateTexture('ground', 200, 32);
    groundGraphics.destroy();
  }

  create() {
    // 添加背景色
    this.cameras.main.setBackgroundColor('#87ceeb');

    // 创建玩家精灵
    this.player = this.physics.add.sprite(400, 300, 'player');
    this.player.setBounce(0);
    this.player.setCollideWorldBounds(true);
    
    // 设置玩家的碰撞体积（稍微小一点，更精确）
    this.player.body.setSize(28, 44);
    this.player.body.setOffset(2, 4);

    // 创建静态地面平台组
    this.platforms = this.physics.add.staticGroup();

    // 添加多个平台
    // 底部主平台
    this.platforms.create(400, 568, 'ground').setScale(4, 1).refreshBody();
    
    // 中间平台
    this.platforms.create(600, 450, 'ground').setScale(1.5, 1).refreshBody();
    this.platforms.create(200, 450, 'ground').setScale(1.5, 1).refreshBody();
    
    // 上方平台
    this.platforms.create(400, 300, 'ground').setScale(2, 1).refreshBody();
    this.platforms.create(100, 200, 'ground').setScale(1, 1).refreshBody();
    this.platforms.create(700, 200, 'ground').setScale(1, 1).refreshBody();

    // 设置玩家与平台的碰撞
    this.physics.add.collider(this.player, this.platforms, () => {
      this.isOnGround = true;
    });

    // 创建键盘输入
    this.cursors = this.input.keyboard.createCursorKeys();
    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

    // 添加信息文本显示
    this.infoText = this.add.text(16, 16, '', {
      fontSize: '18px',
      fill: '#000',
      backgroundColor: '#fff',
      padding: { x: 10, y: 5 }
    });
    this.infoText.setScrollFactor(0);
    this.infoText.setDepth(100);

    // 添加控制说明
    this.add.text(16, 560, '← → 移动 | ↑/空格 跳跃', {
      fontSize: '16px',
      fill: '#000',
      backgroundColor: '#fff',
      padding: { x: 8, y: 4 }
    });

    console.log('游戏初始化完成 - 重力: 500, 移动速度: 200');
  }

  update(time, delta) {
    // 更新状态信号
    this.playerX = Math.round(this.player.x);
    this.playerY = Math.round(this.player.y);

    // 检测是否在地面（通过速度判断）
    if (this.player.body.touching.down) {
      this.isOnGround = true;
    } else {
      this.isOnGround = false;
    }

    // 左右移动控制（速度 200）
    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-200);
      this.player.setFlipX(true);
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(200);
      this.player.setFlipX(false);
    } else {
      // 停止时快速减速
      this.player.setVelocityX(0);
    }

    // 跳跃控制
    const jumpPressed = this.cursors.up.isDown || this.spaceKey.isDown;
    
    if (jumpPressed && this.player.body.touching.down) {
      this.player.setVelocityY(-400);
      this.jumpCount++;
      console.log(`跳跃次数: ${this.jumpCount}`);
    }

    // 更新信息显示
    this.infoText.setText([
      `跳跃次数: ${this.jumpCount}`,
      `位置: (${this.playerX}, ${this.playerY})`,
      `在地面: ${this.isOnGround ? '是' : '否'}`,
      `速度: (${Math.round(this.player.body.velocity.x)}, ${Math.round(this.player.body.velocity.y)})`
    ]);
  }
}

// 游戏配置
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 500 },  // 重力设置为 500
      debug: false
    }
  },
  scene: PlatformScene,
  backgroundColor: '#87ceeb'
};

// 创建游戏实例
const game = new Phaser.Game(config);

// 导出状态供验证
game.getState = function() {
  const scene = game.scene.scenes[0];
  return {
    jumpCount: scene.jumpCount,
    playerX: scene.playerX,
    playerY: scene.playerY,
    isOnGround: scene.isOnGround
  };
};