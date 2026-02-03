class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.wrapCount = 0; // 状态信号：记录玩家穿越边界次数
  }

  preload() {
    // 使用 Graphics 创建青色玩家纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0x00ffff, 1); // 青色
    graphics.fillRect(0, 0, 40, 40);
    graphics.generateTexture('player', 40, 40);
    graphics.destroy();
  }

  create() {
    // 创建青色玩家
    this.player = this.physics.add.sprite(400, 300, 'player');
    this.player.setCollideWorldBounds(false); // 不碰撞边界，允许移出
    
    // 设置键盘输入
    this.cursors = this.input.keyboard.createCursorKeys();
    this.wasd = this.input.keyboard.addKeys({
      up: Phaser.Input.Keyboard.KeyCodes.W,
      down: Phaser.Input.Keyboard.KeyCodes.S,
      left: Phaser.Input.Keyboard.KeyCodes.A,
      right: Phaser.Input.Keyboard.KeyCodes.D
    });

    // 显示穿越次数文本
    this.wrapText = this.add.text(10, 10, 'Wrap Count: 0', {
      fontSize: '20px',
      fill: '#ffffff'
    });

    // 显示玩家位置文本（用于调试）
    this.posText = this.add.text(10, 40, 'Position: (0, 0)', {
      fontSize: '16px',
      fill: '#ffffff'
    });

    // 显示控制提示
    this.add.text(10, 70, 'Controls: Arrow Keys or WASD', {
      fontSize: '16px',
      fill: '#ffff00'
    });
  }

  update(time, delta) {
    // 重置速度
    this.player.setVelocity(0);

    // 处理输入
    if (this.cursors.left.isDown || this.wasd.left.isDown) {
      this.player.setVelocityX(-300);
    } else if (this.cursors.right.isDown || this.wasd.right.isDown) {
      this.player.setVelocityX(300);
    }

    if (this.cursors.up.isDown || this.wasd.up.isDown) {
      this.player.setVelocityY(-300);
    } else if (this.cursors.down.isDown || this.wasd.down.isDown) {
      this.player.setVelocityY(300);
    }

    // 循环地图效果：检测边界并从对侧出现
    const padding = 20; // 精灵半径
    let wrapped = false;

    // 左右边界
    if (this.player.x < -padding) {
      this.player.x = this.cameras.main.width + padding;
      wrapped = true;
    } else if (this.player.x > this.cameras.main.width + padding) {
      this.player.x = -padding;
      wrapped = true;
    }

    // 上下边界
    if (this.player.y < -padding) {
      this.player.y = this.cameras.main.height + padding;
      wrapped = true;
    } else if (this.player.y > this.cameras.main.height + padding) {
      this.player.y = -padding;
      wrapped = true;
    }

    // 如果发生了穿越，增加计数
    if (wrapped) {
      this.wrapCount++;
      this.wrapText.setText('Wrap Count: ' + this.wrapCount);
    }

    // 更新位置显示
    this.posText.setText(
      'Position: (' + 
      Math.round(this.player.x) + ', ' + 
      Math.round(this.player.y) + ')'
    );
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
      gravity: { y: 0 },
      debug: false
    }
  },
  scene: GameScene
};

new Phaser.Game(config);