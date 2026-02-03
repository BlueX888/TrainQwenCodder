class DodgeGameScene extends Phaser.Scene {
  constructor() {
    super('DodgeGameScene');
    this.survivalTime = 0;
    this.enemySpeed = 360;
    this.gameOver = false;
    this.speedIncreaseRate = 20; // 每秒增加的速度
  }

  preload() {
    // 创建玩家纹理
    const playerGraphics = this.make.graphics({ x: 0, y: 0, add: false });
    playerGraphics.fillStyle(0x00ff00, 1);
    playerGraphics.fillRect(0, 0, 32, 32);
    playerGraphics.generateTexture('player', 32, 32);
    playerGraphics.destroy();

    // 创建敌人纹理
    const enemyGraphics = this.make.graphics({ x: 0, y: 0, add: false });
    enemyGraphics.fillStyle(0xff0000, 1);
    enemyGraphics.fillRect(0, 0, 24, 24);
    enemyGraphics.generateTexture('enemy', 24, 24);
    enemyGraphics.destroy();
  }

  create() {
    // 初始化信号对象
    window.__signals__ = {
      survivalTime: 0,
      enemySpeed: 360,
      gameOver: false,
      enemiesSpawned: 0,
      collisions: 0
    };

    // 创建玩家
    this.player = this.physics.add.sprite(400, 500, 'player');
    this.player.setCollideWorldBounds(true);

    // 创建敌人组
    this.enemies = this.physics.add.group();

    // 设置碰撞检测
    this.physics.add.overlap(
      this.player,
      this.enemies,
      this.handleCollision,
      null,
      this
    );

    // 创建键盘控制
    this.cursors = this.input.keyboard.createCursorKeys();

    // 显示生存时间文本
    this.timeText = this.add.text(16, 16, 'Time: 0.0s', {
      fontSize: '24px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 显示速度文本
    this.speedText = this.add.text(16, 50, 'Speed: 360', {
      fontSize: '20px',
      fill: '#ffff00',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 显示游戏说明
    this.add.text(400, 300, 'Use Arrow Keys to Move\nAvoid Red Enemies!', {
      fontSize: '20px',
      fill: '#ffffff',
      align: 'center'
    }).setOrigin(0.5);

    // 定时生成敌人（每0.8秒）
    this.enemySpawnTimer = this.time.addEvent({
      delay: 800,
      callback: this.spawnEnemy,
      callbackScope: this,
      loop: true
    });

    // 定时增加敌人速度（每秒）
    this.speedIncreaseTimer = this.time.addEvent({
      delay: 1000,
      callback: this.increaseSpeed,
      callbackScope: this,
      loop: true
    });

    // 记录游戏开始时间
    this.startTime = this.time.now;
  }

  update(time, delta) {
    if (this.gameOver) {
      return;
    }

    // 更新生存时间
    this.survivalTime = (time - this.startTime) / 1000;
    this.timeText.setText(`Time: ${this.survivalTime.toFixed(1)}s`);

    // 更新信号
    window.__signals__.survivalTime = parseFloat(this.survivalTime.toFixed(1));
    window.__signals__.enemySpeed = this.enemySpeed;

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
    this.enemies.children.entries.forEach((enemy) => {
      if (enemy.y > 650) {
        enemy.destroy();
      }
    });
  }

  spawnEnemy() {
    if (this.gameOver) {
      return;
    }

    // 在顶部随机位置生成敌人
    const x = Phaser.Math.Between(50, 750);
    const enemy = this.enemies.create(x, -20, 'enemy');
    enemy.setVelocityY(this.enemySpeed);

    // 更新信号
    window.__signals__.enemiesSpawned++;
  }

  increaseSpeed() {
    if (this.gameOver) {
      return;
    }

    // 每秒增加速度
    this.enemySpeed += this.speedIncreaseRate;
    this.speedText.setText(`Speed: ${Math.floor(this.enemySpeed)}`);

    // 更新现有敌人的速度
    this.enemies.children.entries.forEach((enemy) => {
      enemy.setVelocityY(this.enemySpeed);
    });
  }

  handleCollision(player, enemy) {
    if (this.gameOver) {
      return;
    }

    this.gameOver = true;
    window.__signals__.gameOver = true;
    window.__signals__.collisions++;

    // 停止游戏
    this.physics.pause();
    this.enemySpawnTimer.remove();
    this.speedIncreaseTimer.remove();

    // 玩家变红
    player.setTint(0xff0000);

    // 显示游戏结束文本
    this.add.text(400, 200, 'GAME OVER!', {
      fontSize: '48px',
      fill: '#ff0000',
      backgroundColor: '#000000',
      padding: { x: 20, y: 10 }
    }).setOrigin(0.5);

    this.add.text(400, 260, `Survived: ${this.survivalTime.toFixed(1)}s`, {
      fontSize: '32px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 15, y: 8 }
    }).setOrigin(0.5);

    this.add.text(400, 310, `Final Speed: ${Math.floor(this.enemySpeed)}`, {
      fontSize: '24px',
      fill: '#ffff00',
      backgroundColor: '#000000',
      padding: { x: 15, y: 8 }
    }).setOrigin(0.5);

    // 输出最终状态到控制台
    console.log(JSON.stringify({
      type: 'GAME_OVER',
      survivalTime: parseFloat(this.survivalTime.toFixed(1)),
      finalSpeed: this.enemySpeed,
      enemiesSpawned: window.__signals__.enemiesSpawned
    }));
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
  scene: DodgeGameScene
};

new Phaser.Game(config);