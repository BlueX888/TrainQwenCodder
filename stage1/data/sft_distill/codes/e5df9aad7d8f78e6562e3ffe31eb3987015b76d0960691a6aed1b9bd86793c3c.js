class EndlessWaveScene extends Phaser.Scene {
  constructor() {
    super('EndlessWaveScene');
    this.currentWave = 0;
    this.killCount = 0;
    this.enemiesRemaining = 0;
    this.isWaveActive = false;
  }

  preload() {
    // 创建玩家纹理
    const playerGraphics = this.make.graphics({ x: 0, y: 0, add: false });
    playerGraphics.fillStyle(0x00ff00, 1);
    playerGraphics.fillTriangle(0, -20, -15, 20, 15, 20);
    playerGraphics.generateTexture('player', 30, 40);
    playerGraphics.destroy();

    // 创建敌人纹理
    const enemyGraphics = this.make.graphics({ x: 0, y: 0, add: false });
    enemyGraphics.fillStyle(0xff0000, 1);
    enemyGraphics.fillCircle(15, 15, 15);
    enemyGraphics.generateTexture('enemy', 30, 30);
    enemyGraphics.destroy();

    // 创建子弹纹理
    const bulletGraphics = this.make.graphics({ x: 0, y: 0, add: false });
    bulletGraphics.fillStyle(0xffff00, 1);
    bulletGraphics.fillRect(0, 0, 4, 10);
    bulletGraphics.generateTexture('bullet', 4, 10);
    bulletGraphics.destroy();
  }

  create() {
    // 创建玩家
    this.player = this.physics.add.sprite(400, 550, 'player');
    this.player.setCollideWorldBounds(true);

    // 创建子弹组
    this.bullets = this.physics.add.group({
      defaultKey: 'bullet',
      maxSize: 30
    });

    // 创建敌人组
    this.enemies = this.physics.add.group({
      defaultKey: 'enemy'
    });

    // 键盘控制
    this.cursors = this.input.keyboard.createCursorKeys();
    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    this.lastFired = 0;

    // 碰撞检测
    this.physics.add.overlap(this.bullets, this.enemies, this.hitEnemy, null, this);

    // UI文本
    this.waveText = this.add.text(16, 16, 'Wave: 0', {
      fontSize: '24px',
      fill: '#ffffff',
      fontFamily: 'Arial'
    });

    this.killText = this.add.text(16, 48, 'Kills: 0', {
      fontSize: '24px',
      fill: '#ffffff',
      fontFamily: 'Arial'
    });

    this.remainingText = this.add.text(16, 80, 'Remaining: 0', {
      fontSize: '24px',
      fill: '#ffffff',
      fontFamily: 'Arial'
    });

    // 开始第一波
    this.startNextWave();
  }

  update(time, delta) {
    // 玩家移动
    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-300);
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(300);
    } else {
      this.player.setVelocityX(0);
    }

    if (this.cursors.up.isDown) {
      this.player.setVelocityY(-300);
    } else if (this.cursors.down.isDown) {
      this.player.setVelocityY(300);
    } else {
      this.player.setVelocityY(0);
    }

    // 发射子弹（限制射速：每200ms一次）
    if (this.spaceKey.isDown && time > this.lastFired + 200) {
      this.fireBullet();
      this.lastFired = time;
    }

    // 清理超出屏幕的子弹
    this.bullets.children.entries.forEach(bullet => {
      if (bullet.active && bullet.y < -10) {
        bullet.setActive(false);
        bullet.setVisible(false);
      }
    });

    // 清理超出屏幕的敌人（视为逃脱）
    this.enemies.children.entries.forEach(enemy => {
      if (enemy.active && enemy.y > 610) {
        enemy.setActive(false);
        enemy.setVisible(false);
        this.enemiesRemaining--;
        this.updateUI();
        this.checkWaveComplete();
      }
    });
  }

  startNextWave() {
    this.currentWave++;
    this.isWaveActive = true;
    
    const enemyCount = 12 + (this.currentWave - 1);
    const enemySpeed = 240 + (this.currentWave - 1) * 20;
    
    this.enemiesRemaining = enemyCount;
    this.updateUI();

    // 分批生成敌人，避免一次性生成太多
    let spawned = 0;
    const spawnInterval = 500; // 每0.5秒生成一个敌人
    
    const spawnTimer = this.time.addEvent({
      delay: spawnInterval,
      callback: () => {
        if (spawned < enemyCount) {
          this.spawnEnemy(enemySpeed);
          spawned++;
        } else {
          spawnTimer.remove();
        }
      },
      loop: true
    });
  }

  spawnEnemy(speed) {
    // 使用固定随机种子以保持确定性（基于波次和已生成数量）
    const x = 50 + (this.enemies.getLength() * 137 % 700); // 伪随机位置
    
    const enemy = this.enemies.get(x, -30, 'enemy');
    
    if (enemy) {
      enemy.setActive(true);
      enemy.setVisible(true);
      enemy.setVelocityY(speed);
      enemy.body.setSize(30, 30);
    }
  }

  fireBullet() {
    const bullet = this.bullets.get(this.player.x, this.player.y - 20, 'bullet');
    
    if (bullet) {
      bullet.setActive(true);
      bullet.setVisible(true);
      bullet.setVelocityY(-500);
      bullet.body.setSize(4, 10);
    }
  }

  hitEnemy(bullet, enemy) {
    // 销毁子弹和敌人
    bullet.setActive(false);
    bullet.setVisible(false);
    bullet.setVelocity(0, 0);
    
    enemy.setActive(false);
    enemy.setVisible(false);
    enemy.setVelocity(0, 0);

    // 更新统计
    this.killCount++;
    this.enemiesRemaining--;
    this.updateUI();

    // 检查是否完成当前波次
    this.checkWaveComplete();
  }

  checkWaveComplete() {
    if (this.isWaveActive && this.enemiesRemaining <= 0) {
      this.isWaveActive = false;
      
      // 显示波次完成提示
      const completeText = this.add.text(400, 300, `Wave ${this.currentWave} Complete!`, {
        fontSize: '48px',
        fill: '#00ff00',
        fontFamily: 'Arial'
      }).setOrigin(0.5);

      // 2秒后开始下一波
      this.time.delayedCall(2000, () => {
        completeText.destroy();
        this.startNextWave();
      });
    }
  }

  updateUI() {
    this.waveText.setText(`Wave: ${this.currentWave}`);
    this.killText.setText(`Kills: ${this.killCount}`);
    this.remainingText.setText(`Remaining: ${this.enemiesRemaining}`);
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

const game = new Phaser.Game(config);

// 可验证的状态信号（用于测试）
window.getGameState = function() {
  const scene = game.scene.scenes[0];
  return {
    currentWave: scene.currentWave,
    killCount: scene.killCount,
    enemiesRemaining: scene.enemiesRemaining,
    isWaveActive: scene.isWaveActive
  };
};