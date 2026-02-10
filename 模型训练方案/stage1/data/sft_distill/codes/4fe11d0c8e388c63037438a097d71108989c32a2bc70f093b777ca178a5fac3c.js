class DodgeGameScene extends Phaser.Scene {
  constructor() {
    super('DodgeGameScene');
    this.player = null;
    this.enemies = null;
    this.cursors = null;
    this.survivalTime = 0;
    this.timeText = null;
    this.gameOver = false;
    this.enemySpeed = 360;
    this.speedIncreaseRate = 20; // 每秒增加的速度
    this.lastSpeedUpdate = 0;
    this.enemySpawnTimer = null;
  }

  preload() {
    // 创建玩家纹理（绿色方块）
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x00ff00, 1);
    playerGraphics.fillRect(0, 0, 40, 40);
    playerGraphics.generateTexture('player', 40, 40);
    playerGraphics.destroy();

    // 创建敌人纹理（红色圆形）
    const enemyGraphics = this.add.graphics();
    enemyGraphics.fillStyle(0xff0000, 1);
    enemyGraphics.fillCircle(20, 20, 20);
    enemyGraphics.generateTexture('enemy', 40, 40);
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
    this.player.body.setSize(40, 40);

    // 创建敌人组
    this.enemies = this.physics.add.group({
      defaultKey: 'enemy',
      maxSize: 50
    });

    // 键盘输入
    this.cursors = this.input.keyboard.createCursorKeys();

    // 碰撞检测
    this.physics.add.overlap(
      this.player,
      this.enemies,
      this.handleCollision,
      null,
      this
    );

    // 生存时间文本
    this.timeText = this.add.text(16, 16, 'Time: 0.0s', {
      fontSize: '32px',
      fill: '#fff',
      fontFamily: 'Arial'
    });

    // 速度显示文本
    this.speedText = this.add.text(16, 56, 'Enemy Speed: 360', {
      fontSize: '24px',
      fill: '#ffff00',
      fontFamily: 'Arial'
    });

    // 游戏说明
    this.add.text(400, 100, 'Use Arrow Keys to Dodge!', {
      fontSize: '28px',
      fill: '#fff',
      fontFamily: 'Arial'
    }).setOrigin(0.5);

    // 定时生成敌人（每0.8秒）
    this.enemySpawnTimer = this.time.addEvent({
      delay: 800,
      callback: this.spawnEnemy,
      callbackScope: this,
      loop: true
    });

    // 初始生成几个敌人
    this.time.delayedCall(100, () => this.spawnEnemy());
    this.time.delayedCall(400, () => this.spawnEnemy());
  }

  spawnEnemy() {
    if (this.gameOver) return;

    const x = Phaser.Math.Between(20, 780);
    const enemy = this.enemies.get(x, -20, 'enemy');

    if (enemy) {
      enemy.setActive(true);
      enemy.setVisible(true);
      enemy.body.setSize(40, 40);
      enemy.setVelocityY(this.enemySpeed);
      
      window.__signals__.enemiesSpawned++;
      
      console.log(JSON.stringify({
        event: 'enemy_spawned',
        position: { x, y: -20 },
        speed: this.enemySpeed,
        time: this.survivalTime.toFixed(2)
      }));
    }
  }

  handleCollision(player, enemy) {
    if (this.gameOver) return;

    this.gameOver = true;
    window.__signals__.gameOver = true;
    window.__signals__.collisions++;

    console.log(JSON.stringify({
      event: 'game_over',
      survivalTime: this.survivalTime.toFixed(2),
      finalSpeed: this.enemySpeed,
      enemiesSpawned: window.__signals__.enemiesSpawned
    }));

    // 停止游戏
    this.physics.pause();
    this.enemySpawnTimer.remove();

    // 玩家变红
    this.player.setTint(0xff0000);

    // 显示游戏结束文本
    const gameOverText = this.add.text(400, 300, 'GAME OVER!', {
      fontSize: '64px',
      fill: '#ff0000',
      fontFamily: 'Arial',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    const finalTimeText = this.add.text(400, 380, 
      `Survival Time: ${this.survivalTime.toFixed(2)}s`, {
      fontSize: '32px',
      fill: '#fff',
      fontFamily: 'Arial'
    }).setOrigin(0.5);

    const restartText = this.add.text(400, 450, 
      'Press R to Restart', {
      fontSize: '24px',
      fill: '#ffff00',
      fontFamily: 'Arial'
    }).setOrigin(0.5);

    // 重启功能
    this.input.keyboard.once('keydown-R', () => {
      this.scene.restart();
    });
  }

  update(time, delta) {
    if (this.gameOver) return;

    // 更新生存时间
    this.survivalTime += delta / 1000;
    this.timeText.setText(`Time: ${this.survivalTime.toFixed(1)}s`);
    window.__signals__.survivalTime = parseFloat(this.survivalTime.toFixed(2));

    // 每秒增加敌人速度
    const currentSecond = Math.floor(this.survivalTime);
    if (currentSecond > this.lastSpeedUpdate) {
      this.lastSpeedUpdate = currentSecond;
      this.enemySpeed += this.speedIncreaseRate;
      window.__signals__.enemySpeed = this.enemySpeed;
      
      this.speedText.setText(`Enemy Speed: ${this.enemySpeed}`);
      
      console.log(JSON.stringify({
        event: 'speed_increased',
        newSpeed: this.enemySpeed,
        time: this.survivalTime.toFixed(2)
      }));
    }

    // 玩家移动控制
    const playerSpeed = 400;
    
    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-playerSpeed);
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(playerSpeed);
    } else {
      this.player.setVelocityX(0);
    }

    if (this.cursors.up.isDown) {
      this.player.setVelocityY(-playerSpeed);
    } else if (this.cursors.down.isDown) {
      this.player.setVelocityY(playerSpeed);
    } else {
      this.player.setVelocityY(0);
    }

    // 清理超出屏幕的敌人
    this.enemies.children.entries.forEach(enemy => {
      if (enemy.active && enemy.y > 650) {
        enemy.setActive(false);
        enemy.setVisible(false);
        enemy.body.stop();
      }
    });

    // 更新现有敌人的速度
    this.enemies.children.entries.forEach(enemy => {
      if (enemy.active) {
        enemy.setVelocityY(this.enemySpeed);
      }
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
  scene: DodgeGameScene
};

const game = new Phaser.Game(config);