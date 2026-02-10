class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.gameOver = false;
    this.survivedTime = 0;
    this.health = 100;
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 创建玩家纹理（蓝色圆形）
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x0000ff, 1);
    playerGraphics.fillCircle(16, 16, 16);
    playerGraphics.generateTexture('player', 32, 32);
    playerGraphics.destroy();

    // 创建敌人纹理（红色圆形）
    const enemyGraphics = this.add.graphics();
    enemyGraphics.fillStyle(0xff0000, 1);
    enemyGraphics.fillCircle(12, 12, 12);
    enemyGraphics.generateTexture('enemy', 24, 24);
    enemyGraphics.destroy();

    // 创建玩家
    this.player = this.physics.add.sprite(400, 300, 'player');
    this.player.setCollideWorldBounds(true);

    // 创建敌人组
    this.enemies = this.physics.add.group();
    
    // 在不同位置创建5个敌人
    const enemyPositions = [
      { x: 100, y: 100 },
      { x: 700, y: 100 },
      { x: 100, y: 500 },
      { x: 700, y: 500 },
      { x: 400, y: 50 }
    ];

    enemyPositions.forEach(pos => {
      const enemy = this.enemies.create(pos.x, pos.y, 'enemy');
      enemy.setCollideWorldBounds(true);
    });

    // 添加碰撞检测
    this.physics.add.overlap(this.player, this.enemies, this.hitEnemy, null, this);

    // 创建键盘控制
    this.cursors = this.input.keyboard.createCursorKeys();

    // 创建UI文本
    this.timeText = this.add.text(16, 16, 'Time: 0s', {
      fontSize: '20px',
      fill: '#fff'
    });

    this.healthText = this.add.text(16, 40, 'Health: 100', {
      fontSize: '20px',
      fill: '#fff'
    });

    this.statusText = this.add.text(400, 300, '', {
      fontSize: '32px',
      fill: '#ff0000',
      align: 'center'
    }).setOrigin(0.5);

    // 添加提示文字
    this.add.text(400, 550, 'Use Arrow Keys to Move and Avoid Enemies!', {
      fontSize: '18px',
      fill: '#ffff00',
      align: 'center'
    }).setOrigin(0.5);
  }

  update(time, delta) {
    if (this.gameOver) {
      return;
    }

    // 更新存活时间
    this.survivedTime += delta;
    this.timeText.setText('Time: ' + Math.floor(this.survivedTime / 1000) + 's');
    this.healthText.setText('Health: ' + this.health);

    // 玩家移动控制
    const playerSpeed = 300;
    this.player.setVelocity(0);

    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-playerSpeed);
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(playerSpeed);
    }

    if (this.cursors.up.isDown) {
      this.player.setVelocityY(-playerSpeed);
    } else if (this.cursors.down.isDown) {
      this.player.setVelocityY(playerSpeed);
    }

    // 敌人追踪玩家
    const enemySpeed = 360;
    this.enemies.children.entries.forEach(enemy => {
      this.physics.moveToObject(enemy, this.player, enemySpeed);
    });
  }

  hitEnemy(player, enemy) {
    if (this.gameOver) {
      return;
    }

    // 减少生命值
    this.health -= 20;
    this.healthText.setText('Health: ' + this.health);

    // 敌人短暂击退效果
    const angle = Phaser.Math.Angle.Between(
      player.x, player.y,
      enemy.x, enemy.y
    );
    enemy.setVelocity(
      Math.cos(angle) * -200,
      Math.sin(angle) * -200
    );

    // 检查是否游戏结束
    if (this.health <= 0) {
      this.gameOver = true;
      this.health = 0;
      
      // 停止所有移动
      this.player.setVelocity(0);
      this.enemies.children.entries.forEach(enemy => {
        enemy.setVelocity(0);
      });

      // 显示游戏结束信息
      this.statusText.setText(
        'GAME OVER!\n' +
        'Survived: ' + Math.floor(this.survivedTime / 1000) + 's\n' +
        'Press R to Restart'
      );

      // 添加重启功能
      this.input.keyboard.once('keydown-R', () => {
        this.scene.restart();
      });
    }
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