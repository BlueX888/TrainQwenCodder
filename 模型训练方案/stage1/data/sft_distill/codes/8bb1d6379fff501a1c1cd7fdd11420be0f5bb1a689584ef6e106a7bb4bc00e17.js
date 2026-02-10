class DodgeGame extends Phaser.Scene {
  constructor() {
    super('DodgeGame');
    this.survivalTime = 0;
    this.enemySpeed = 120;
    this.isGameOver = false;
    this.startTime = 0;
  }

  preload() {
    // 使用Graphics生成纹理，无需外部资源
  }

  create() {
    // 记录游戏开始时间
    this.startTime = this.time.now;
    this.survivalTime = 0;
    this.enemySpeed = 120;
    this.isGameOver = false;

    // 创建玩家纹理（蓝色方块）
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x0000ff, 1);
    playerGraphics.fillRect(0, 0, 32, 32);
    playerGraphics.generateTexture('player', 32, 32);
    playerGraphics.destroy();

    // 创建敌人纹理（红色方块）
    const enemyGraphics = this.add.graphics();
    enemyGraphics.fillStyle(0xff0000, 1);
    enemyGraphics.fillRect(0, 0, 24, 24);
    enemyGraphics.generateTexture('enemy', 24, 24);
    enemyGraphics.destroy();

    // 创建玩家
    this.player = this.physics.add.sprite(400, 500, 'player');
    this.player.setCollideWorldBounds(true);

    // 创建敌人组
    this.enemies = this.physics.add.group();

    // 设置键盘控制
    this.cursors = this.input.keyboard.createCursorKeys();

    // 碰撞检测
    this.physics.add.overlap(this.player, this.enemies, this.hitEnemy, null, this);

    // 创建生存时间文本
    this.timeText = this.add.text(16, 16, '生存时间: 0.0s', {
      fontSize: '24px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 创建速度显示文本
    this.speedText = this.add.text(16, 50, '敌人速度: 120', {
      fontSize: '20px',
      fill: '#ffff00',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 游戏结束文本（初始隐藏）
    this.gameOverText = this.add.text(400, 300, '', {
      fontSize: '48px',
      fill: '#ff0000',
      backgroundColor: '#000000',
      padding: { x: 20, y: 10 }
    });
    this.gameOverText.setOrigin(0.5);
    this.gameOverText.setVisible(false);

    // 定时生成敌人（每0.8秒）
    this.enemyTimer = this.time.addEvent({
      delay: 800,
      callback: this.spawnEnemy,
      callbackScope: this,
      loop: true
    });

    // 每秒增加敌人速度
    this.speedTimer = this.time.addEvent({
      delay: 1000,
      callback: this.increaseSpeed,
      callbackScope: this,
      loop: true
    });
  }

  update(time, delta) {
    if (this.isGameOver) {
      return;
    }

    // 更新生存时间
    this.survivalTime = (time - this.startTime) / 1000;
    this.timeText.setText(`生存时间: ${this.survivalTime.toFixed(1)}s`);

    // 玩家移动控制
    const speed = 300;
    this.player.setVelocity(0);

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

    // 清理超出屏幕的敌人
    this.enemies.children.entries.forEach(enemy => {
      if (enemy.y > 650) {
        enemy.destroy();
      }
    });
  }

  spawnEnemy() {
    if (this.isGameOver) {
      return;
    }

    // 随机X位置生成敌人
    const x = Phaser.Math.Between(20, 780);
    const enemy = this.enemies.create(x, -20, 'enemy');
    
    // 设置敌人速度（向下移动）
    enemy.setVelocityY(this.enemySpeed);
  }

  increaseSpeed() {
    if (this.isGameOver) {
      return;
    }

    // 每秒增加敌人速度10
    this.enemySpeed += 10;
    this.speedText.setText(`敌人速度: ${Math.floor(this.enemySpeed)}`);

    // 更新现有敌人的速度
    this.enemies.children.entries.forEach(enemy => {
      enemy.setVelocityY(this.enemySpeed);
    });
  }

  hitEnemy(player, enemy) {
    if (this.isGameOver) {
      return;
    }

    // 游戏结束
    this.isGameOver = true;

    // 停止所有定时器
    this.enemyTimer.remove();
    this.speedTimer.remove();

    // 停止所有物体
    this.physics.pause();

    // 显示游戏结束信息
    this.gameOverText.setText(
      `游戏结束!\n生存时间: ${this.survivalTime.toFixed(1)}秒\n\n点击重新开始`
    );
    this.gameOverText.setVisible(true);

    // 玩家变红表示碰撞
    this.player.setTint(0xff0000);

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
  scene: DodgeGame
};

const game = new Phaser.Game(config);

// 可验证的状态信号
console.log('Game initialized with initial enemy speed: 120');