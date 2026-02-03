class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.currentWave = 1;
    this.enemiesPerWave = 20;
    this.enemySpeed = 120;
    this.totalKilled = 0;
    this.waveTransitionDelay = 2000; // 2秒
    this.isTransitioning = false;
  }

  preload() {
    // 创建玩家纹理
    const playerGraphics = this.make.graphics({ x: 0, y: 0, add: false });
    playerGraphics.fillStyle(0x00ff00, 1);
    playerGraphics.fillRect(0, 0, 40, 40);
    playerGraphics.generateTexture('player', 40, 40);
    playerGraphics.destroy();

    // 创建敌人纹理（粉色）
    const enemyGraphics = this.make.graphics({ x: 0, y: 0, add: false });
    enemyGraphics.fillStyle(0xff69b4, 1);
    enemyGraphics.fillCircle(15, 15, 15);
    enemyGraphics.generateTexture('enemy', 30, 30);
    enemyGraphics.destroy();

    // 创建子弹纹理
    const bulletGraphics = this.make.graphics({ x: 0, y: 0, add: false });
    bulletGraphics.fillStyle(0xffff00, 1);
    bulletGraphics.fillRect(0, 0, 5, 10);
    bulletGraphics.generateTexture('bullet', 5, 10);
    bulletGraphics.destroy();
  }

  create() {
    // 创建玩家
    this.player = this.physics.add.sprite(400, 550, 'player');
    this.player.setCollideWorldBounds(true);

    // 创建键盘控制
    this.cursors = this.input.keyboard.createCursorKeys();
    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    this.lastFireTime = 0;
    this.fireRate = 200; // 发射间隔

    // 创建敌人组
    this.enemies = this.physics.add.group();

    // 创建子弹组
    this.bullets = this.physics.add.group({
      defaultKey: 'bullet',
      maxSize: 50
    });

    // 碰撞检测：子弹击中敌人
    this.physics.add.overlap(this.bullets, this.enemies, this.hitEnemy, null, this);

    // 碰撞检测：玩家碰到敌人（可选，这里仅作演示）
    this.physics.add.overlap(this.player, this.enemies, this.playerHitEnemy, null, this);

    // UI文本
    this.waveText = this.add.text(16, 16, '', {
      fontSize: '24px',
      fill: '#fff',
      fontFamily: 'Arial'
    });

    this.enemyCountText = this.add.text(16, 50, '', {
      fontSize: '20px',
      fill: '#fff',
      fontFamily: 'Arial'
    });

    this.killCountText = this.add.text(16, 80, '', {
      fontSize: '20px',
      fill: '#fff',
      fontFamily: 'Arial'
    });

    this.statusText = this.add.text(400, 300, '', {
      fontSize: '32px',
      fill: '#ffff00',
      fontFamily: 'Arial'
    }).setOrigin(0.5);

    // 开始第一波
    this.startWave();
  }

  update(time, delta) {
    if (this.isTransitioning) {
      return;
    }

    // 玩家移动
    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-300);
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(300);
    } else {
      this.player.setVelocityX(0);
    }

    // 射击
    if (this.spaceKey.isDown && time > this.lastFireTime + this.fireRate) {
      this.fireBullet();
      this.lastFireTime = time;
    }

    // 检查敌人是否超出屏幕底部
    this.enemies.children.entries.forEach(enemy => {
      if (enemy.y > 620) {
        enemy.destroy();
      }
    });

    // 更新UI
    this.updateUI();

    // 检查是否所有敌人被消灭
    if (this.enemies.countActive(true) === 0 && !this.isTransitioning) {
      this.onWaveComplete();
    }
  }

  startWave() {
    this.isTransitioning = false;
    this.statusText.setText('');

    // 生成敌人
    for (let i = 0; i < this.enemiesPerWave; i++) {
      // 延迟生成，避免所有敌人同时出现
      this.time.delayedCall(i * 100, () => {
        this.spawnEnemy();
      });
    }
  }

  spawnEnemy() {
    // 随机X位置，固定从顶部生成
    const x = Phaser.Math.Between(50, 750);
    const enemy = this.enemies.create(x, -30, 'enemy');
    
    // 设置敌人速度（向下移动）
    enemy.setVelocityY(this.enemySpeed);
    
    // 添加轻微的水平随机移动
    enemy.setVelocityX(Phaser.Math.Between(-30, 30));
  }

  fireBullet() {
    const bullet = this.bullets.get(this.player.x, this.player.y - 20);
    
    if (bullet) {
      bullet.setActive(true);
      bullet.setVisible(true);
      bullet.setVelocityY(-400);
      
      // 子弹超出屏幕后回收
      this.time.delayedCall(2000, () => {
        if (bullet.active) {
          bullet.setActive(false);
          bullet.setVisible(false);
        }
      });
    }
  }

  hitEnemy(bullet, enemy) {
    // 销毁子弹和敌人
    bullet.setActive(false);
    bullet.setVisible(false);
    enemy.destroy();
    
    // 增加击杀数
    this.totalKilled++;
  }

  playerHitEnemy(player, enemy) {
    // 玩家碰到敌人，敌人消失（简化处理）
    enemy.destroy();
  }

  onWaveComplete() {
    this.isTransitioning = true;
    this.statusText.setText(`Wave ${this.currentWave} Complete!\nNext wave in 2 seconds...`);

    // 2秒后进入下一波
    this.time.delayedCall(this.waveTransitionDelay, () => {
      this.currentWave++;
      this.startWave();
    });
  }

  updateUI() {
    this.waveText.setText(`Wave: ${this.currentWave}`);
    this.enemyCountText.setText(`Enemies Left: ${this.enemies.countActive(true)}`);
    this.killCountText.setText(`Total Killed: ${this.totalKilled}`);
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