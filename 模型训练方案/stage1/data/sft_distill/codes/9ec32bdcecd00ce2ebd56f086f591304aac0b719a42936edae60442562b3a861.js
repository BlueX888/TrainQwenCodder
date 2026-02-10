class EndlessWaveScene extends Phaser.Scene {
  constructor() {
    super('EndlessWaveScene');
    this.wave = 0;
    this.kills = 0;
    this.enemiesRemaining = 0;
    this.baseEnemySpeed = 300;
    this.isWaveActive = false;
  }

  preload() {
    // 创建玩家纹理
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x00ff00, 1);
    playerGraphics.fillTriangle(0, -20, -15, 15, 15, 15);
    playerGraphics.generateTexture('player', 30, 35);
    playerGraphics.destroy();

    // 创建敌人纹理
    const enemyGraphics = this.add.graphics();
    enemyGraphics.fillStyle(0xff0000, 1);
    enemyGraphics.fillCircle(15, 15, 15);
    enemyGraphics.generateTexture('enemy', 30, 30);
    enemyGraphics.destroy();

    // 创建子弹纹理
    const bulletGraphics = this.add.graphics();
    bulletGraphics.fillStyle(0xffff00, 1);
    bulletGraphics.fillRect(0, 0, 4, 10);
    bulletGraphics.generateTexture('bullet', 4, 10);
    bulletGraphics.destroy();
  }

  create() {
    // 初始化物理系统
    this.physics.world.setBounds(0, 0, 800, 600);

    // 创建玩家
    this.player = this.physics.add.sprite(400, 500, 'player');
    this.player.setCollideWorldBounds(true);
    this.player.setDamping(true);
    this.player.setDrag(0.8);

    // 玩家生命值
    this.playerHealth = 3;

    // 创建子弹组
    this.bullets = this.physics.add.group({
      defaultKey: 'bullet',
      maxSize: 30,
      runChildUpdate: true
    });

    // 创建敌人组
    this.enemies = this.physics.add.group({
      defaultKey: 'enemy',
      maxSize: 100
    });

    // 键盘输入
    this.cursors = this.input.keyboard.createCursorKeys();
    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    
    // 射击冷却
    this.lastFired = 0;
    this.fireRate = 200;

    // 碰撞检测
    this.physics.add.overlap(this.bullets, this.enemies, this.hitEnemy, null, this);
    this.physics.add.overlap(this.player, this.enemies, this.hitPlayer, null, this);

    // UI文本
    this.waveText = this.add.text(16, 16, 'Wave: 0', {
      fontSize: '24px',
      fill: '#ffffff',
      fontFamily: 'Arial'
    });

    this.killsText = this.add.text(16, 48, 'Kills: 0', {
      fontSize: '24px',
      fill: '#ffffff',
      fontFamily: 'Arial'
    });

    this.remainingText = this.add.text(16, 80, 'Remaining: 0', {
      fontSize: '24px',
      fill: '#ffffff',
      fontFamily: 'Arial'
    });

    this.healthText = this.add.text(16, 112, 'Health: 3', {
      fontSize: '24px',
      fill: '#ffffff',
      fontFamily: 'Arial'
    });

    this.statusText = this.add.text(400, 300, 'Press SPACE to start Wave 1', {
      fontSize: '32px',
      fill: '#00ff00',
      fontFamily: 'Arial'
    }).setOrigin(0.5);

    // 游戏状态
    this.gameOver = false;
    this.waitingForNextWave = true;
  }

  update(time, delta) {
    if (this.gameOver) return;

    // 等待开始下一波
    if (this.waitingForNextWave) {
      if (Phaser.Input.Keyboard.JustDown(this.spaceKey)) {
        this.startNextWave();
      }
      return;
    }

    // 玩家移动
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

    // 射击
    if (this.spaceKey.isDown && time > this.lastFired + this.fireRate) {
      this.fire();
      this.lastFired = time;
    }

    // 敌人追踪玩家
    this.enemies.children.entries.forEach(enemy => {
      if (enemy.active) {
        this.physics.moveToObject(enemy, this.player, enemy.getData('speed'));
      }
    });

    // 检查波次是否完成
    if (this.isWaveActive && this.enemiesRemaining === 0) {
      this.completeWave();
    }
  }

  startNextWave() {
    this.wave++;
    this.isWaveActive = true;
    this.waitingForNextWave = false;
    this.statusText.setVisible(false);

    // 计算本波敌人数量和速度
    const enemyCount = 15 + (this.wave - 1);
    const enemySpeed = this.baseEnemySpeed + (this.wave - 1) * 20;
    this.enemiesRemaining = enemyCount;

    // 更新UI
    this.waveText.setText(`Wave: ${this.wave}`);
    this.remainingText.setText(`Remaining: ${this.enemiesRemaining}`);

    // 生成敌人
    this.spawnEnemies(enemyCount, enemySpeed);
  }

  spawnEnemies(count, speed) {
    const spawnDelay = 500; // 每个敌人生成间隔
    
    for (let i = 0; i < count; i++) {
      this.time.delayedCall(i * spawnDelay, () => {
        const side = Phaser.Math.Between(0, 3);
        let x, y;

        // 从四个边随机生成
        switch (side) {
          case 0: // 上
            x = Phaser.Math.Between(0, 800);
            y = -30;
            break;
          case 1: // 右
            x = 830;
            y = Phaser.Math.Between(0, 600);
            break;
          case 2: // 下
            x = Phaser.Math.Between(0, 800);
            y = 630;
            break;
          case 3: // 左
            x = -30;
            y = Phaser.Math.Between(0, 600);
            break;
        }

        const enemy = this.enemies.get(x, y, 'enemy');
        if (enemy) {
          enemy.setActive(true);
          enemy.setVisible(true);
          enemy.setData('speed', speed);
          enemy.body.enable = true;
        }
      });
    }
  }

  fire() {
    const bullet = this.bullets.get(this.player.x, this.player.y - 20, 'bullet');
    if (bullet) {
      bullet.setActive(true);
      bullet.setVisible(true);
      bullet.body.enable = true;
      bullet.setVelocityY(-500);
      
      // 子弹出界自动回收
      bullet.update = function() {
        if (this.y < -10) {
          this.setActive(false);
          this.setVisible(false);
          this.body.enable = false;
        }
      };
    }
  }

  hitEnemy(bullet, enemy) {
    // 回收子弹
    bullet.setActive(false);
    bullet.setVisible(false);
    bullet.body.enable = false;

    // 回收敌人
    enemy.setActive(false);
    enemy.setVisible(false);
    enemy.body.enable = false;

    // 更新统计
    this.kills++;
    this.enemiesRemaining--;
    this.killsText.setText(`Kills: ${this.kills}`);
    this.remainingText.setText(`Remaining: ${this.enemiesRemaining}`);
  }

  hitPlayer(player, enemy) {
    // 回收敌人
    enemy.setActive(false);
    enemy.setVisible(false);
    enemy.body.enable = false;

    // 减少生命值
    this.playerHealth--;
    this.enemiesRemaining--;
    this.healthText.setText(`Health: ${this.playerHealth}`);
    this.remainingText.setText(`Remaining: ${this.enemiesRemaining}`);

    // 玩家闪烁效果
    this.tweens.add({
      targets: this.player,
      alpha: 0.3,
      duration: 100,
      yoyo: true,
      repeat: 3
    });

    // 检查游戏结束
    if (this.playerHealth <= 0) {
      this.endGame();
    }
  }

  completeWave() {
    this.isWaveActive = false;
    this.waitingForNextWave = true;
    
    this.statusText.setText(`Wave ${this.wave} Complete!\nPress SPACE for Wave ${this.wave + 1}`);
    this.statusText.setVisible(true);
  }

  endGame() {
    this.gameOver = true;
    this.isWaveActive = false;
    
    this.statusText.setText(`Game Over!\nWave: ${this.wave}\nKills: ${this.kills}`);
    this.statusText.setVisible(true);
    this.statusText.setColor('#ff0000');

    // 停止所有敌人
    this.enemies.children.entries.forEach(enemy => {
      if (enemy.active) {
        enemy.body.setVelocity(0);
      }
    });

    this.player.setTint(0xff0000);
  }
}

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#000000',
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 },
      debug: false
    }
  },
  scene: EndlessWaveScene
};

new Phaser.Game(config);