class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.playerSpeed = 360 * 1.2; // 432
    this.enemySpeed = 360;
    this.distanceToEnemy = 0;
    this.isCaught = false;
    this.survivalTime = 0;
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 创建玩家纹理（蓝色方块）
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x0000ff, 1);
    playerGraphics.fillRect(0, 0, 32, 32);
    playerGraphics.generateTexture('player', 32, 32);
    playerGraphics.destroy();

    // 创建敌人纹理（橙色圆形）
    const enemyGraphics = this.add.graphics();
    enemyGraphics.fillStyle(0xff8800, 1);
    enemyGraphics.fillCircle(20, 20, 20);
    enemyGraphics.generateTexture('enemy', 40, 40);
    enemyGraphics.destroy();

    // 创建玩家精灵（居中位置）
    this.player = this.physics.add.sprite(400, 300, 'player');
    this.player.setCollideWorldBounds(true);

    // 创建敌人精灵（左上角）
    this.enemy = this.physics.add.sprite(100, 100, 'enemy');

    // 设置键盘输入
    this.cursors = this.input.keyboard.createCursorKeys();
    this.wasd = this.input.keyboard.addKeys({
      up: Phaser.Input.Keyboard.KeyCodes.W,
      down: Phaser.Input.Keyboard.KeyCodes.S,
      left: Phaser.Input.Keyboard.KeyCodes.A,
      right: Phaser.Input.Keyboard.KeyCodes.D
    });

    // 添加碰撞检测
    this.physics.add.overlap(this.player, this.enemy, this.onCatch, null, this);

    // 创建信息文本
    this.infoText = this.add.text(10, 10, '', {
      fontSize: '16px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    this.statusText = this.add.text(10, 60, '', {
      fontSize: '20px',
      fill: '#00ff00',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 添加说明文本
    this.add.text(400, 550, '使用方向键或WASD移动 | 玩家速度: 432 | 敌人速度: 360', {
      fontSize: '14px',
      fill: '#ffffff'
    }).setOrigin(0.5);
  }

  update(time, delta) {
    if (this.isCaught) {
      return;
    }

    // 更新生存时间
    this.survivalTime += delta / 1000;

    // 玩家移动控制
    this.player.setVelocity(0);

    let moveX = 0;
    let moveY = 0;

    if (this.cursors.left.isDown || this.wasd.left.isDown) {
      moveX = -1;
    } else if (this.cursors.right.isDown || this.wasd.right.isDown) {
      moveX = 1;
    }

    if (this.cursors.up.isDown || this.wasd.up.isDown) {
      moveY = -1;
    } else if (this.cursors.down.isDown || this.wasd.down.isDown) {
      moveY = 1;
    }

    // 归一化对角线移动
    if (moveX !== 0 && moveY !== 0) {
      const length = Math.sqrt(moveX * moveX + moveY * moveY);
      moveX /= length;
      moveY /= length;
    }

    this.player.setVelocity(
      moveX * this.playerSpeed,
      moveY * this.playerSpeed
    );

    // 敌人追踪玩家
    this.physics.moveToObject(this.enemy, this.player, this.enemySpeed);

    // 计算距离
    this.distanceToEnemy = Phaser.Math.Distance.Between(
      this.player.x,
      this.player.y,
      this.enemy.x,
      this.enemy.y
    );

    // 更新信息显示
    this.infoText.setText([
      `距离敌人: ${Math.floor(this.distanceToEnemy)} px`,
      `生存时间: ${this.survivalTime.toFixed(1)} 秒`,
      `玩家位置: (${Math.floor(this.player.x)}, ${Math.floor(this.player.y)})`,
      `敌人位置: (${Math.floor(this.enemy.x)}, ${Math.floor(this.enemy.y)})`
    ]);

    // 更新状态
    if (this.distanceToEnemy > 200) {
      this.statusText.setText('状态: 安全距离 ✓');
      this.statusText.setColor('#00ff00');
    } else if (this.distanceToEnemy > 100) {
      this.statusText.setText('状态: 警告 ⚠');
      this.statusText.setColor('#ffff00');
    } else {
      this.statusText.setText('状态: 危险 ⚠⚠⚠');
      this.statusText.setColor('#ff0000');
    }
  }

  onCatch(player, enemy) {
    if (this.isCaught) {
      return;
    }

    this.isCaught = true;

    // 停止所有移动
    this.player.setVelocity(0);
    this.enemy.setVelocity(0);

    // 显示被抓住的信息
    this.statusText.setText('状态: 被抓住! ✗');
    this.statusText.setColor('#ff0000');

    const gameOverText = this.add.text(400, 300, [
      '游戏结束!',
      `生存时间: ${this.survivalTime.toFixed(1)} 秒`,
      '',
      '点击刷新重新开始'
    ], {
      fontSize: '32px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 20, y: 15 },
      align: 'center'
    }).setOrigin(0.5);

    // 点击重新开始
    this.input.once('pointerdown', () => {
      this.scene.restart();
    });
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