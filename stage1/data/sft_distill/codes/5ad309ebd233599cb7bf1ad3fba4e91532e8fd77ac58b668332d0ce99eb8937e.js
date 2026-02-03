// LoadingScene - 资源预加载场景
class LoadingScene extends Phaser.Scene {
  constructor() {
    super('LoadingScene');
    this.loadingComplete = false;
  }

  preload() {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    // 创建加载文字
    const loadingText = this.add.text(width / 2, height / 2 - 50, 'Loading...', {
      fontSize: '32px',
      color: '#ffffff'
    });
    loadingText.setOrigin(0.5, 0.5);

    // 创建进度条背景
    const progressBar = this.add.graphics();
    const progressBox = this.add.graphics();
    progressBox.fillStyle(0x222222, 0.8);
    progressBox.fillRect(width / 2 - 160, height / 2, 320, 50);

    // 创建百分比文字
    const percentText = this.add.text(width / 2, height / 2 + 25, '0%', {
      fontSize: '24px',
      color: '#ffffff'
    });
    percentText.setOrigin(0.5, 0.5);

    // 监听加载进度
    this.load.on('progress', (value) => {
      // 清除之前的进度条
      progressBar.clear();
      // 绘制绿色进度条
      progressBar.fillStyle(0x00ff00, 1);
      progressBar.fillRect(width / 2 - 150, height / 2 + 10, 300 * value, 30);
      
      // 更新百分比
      percentText.setText(parseInt(value * 100) + '%');
    });

    // 加载完成事件
    this.load.on('complete', () => {
      this.loadingComplete = true;
      loadingText.setText('Loading Complete!');
      progressBar.destroy();
      progressBox.destroy();
      percentText.destroy();
    });

    // 模拟加载资源 - 使用多个假资源来展示进度
    // 创建一些虚拟纹理数据
    for (let i = 0; i < 10; i++) {
      // 创建临时canvas作为纹理源
      const canvas = document.createElement('canvas');
      canvas.width = 32;
      canvas.height = 32;
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = '#' + Math.floor(Math.random() * 16777215).toString(16);
      ctx.fillRect(0, 0, 32, 32);
      
      this.load.image(`asset${i}`, canvas.toDataURL());
    }
  }

  create() {
    // 等待一小段时间让用户看到加载完成提示
    this.time.delayedCall(500, () => {
      // 切换到主场景
      this.scene.start('MainScene');
    });
  }
}

// MainScene - 主游戏场景
class MainScene extends Phaser.Scene {
  constructor() {
    super('MainScene');
    // 可验证的状态信号
    this.gameState = {
      score: 0,
      health: 100,
      level: 1,
      loadingCompleted: true,
      sceneActive: true
    };
  }

  create() {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    // 背景
    const bg = this.add.graphics();
    bg.fillStyle(0x1a1a2e, 1);
    bg.fillRect(0, 0, width, height);

    // 标题
    const title = this.add.text(width / 2, 80, 'Main Scene', {
      fontSize: '48px',
      color: '#00ff00',
      fontStyle: 'bold'
    });
    title.setOrigin(0.5);

    // 显示状态信息
    const statusText = this.add.text(width / 2, height / 2 - 80, 
      'Loading Complete!\nResources Loaded Successfully', {
      fontSize: '24px',
      color: '#ffffff',
      align: 'center'
    });
    statusText.setOrigin(0.5);

    // 显示游戏状态（可验证信号）
    this.stateDisplay = this.add.text(width / 2, height / 2, '', {
      fontSize: '20px',
      color: '#ffff00',
      align: 'center'
    });
    this.stateDisplay.setOrigin(0.5);
    this.updateStateDisplay();

    // 创建一个简单的交互元素
    const interactiveBox = this.add.graphics();
    interactiveBox.fillStyle(0x00ff00, 1);
    interactiveBox.fillRect(width / 2 - 75, height / 2 + 80, 150, 60);
    
    const buttonText = this.add.text(width / 2, height / 2 + 110, 'Click to Score', {
      fontSize: '20px',
      color: '#000000'
    });
    buttonText.setOrigin(0.5);

    // 设置交互区域
    const zone = this.add.zone(width / 2, height / 2 + 110, 150, 60)
      .setInteractive({ useHandCursor: true });

    zone.on('pointerdown', () => {
      this.gameState.score += 10;
      if (this.gameState.score % 50 === 0) {
        this.gameState.level++;
      }
      this.updateStateDisplay();
      
      // 视觉反馈
      this.tweens.add({
        targets: interactiveBox,
        alpha: 0.5,
        duration: 100,
        yoyo: true
      });
    });

    // 提示信息
    const hint = this.add.text(width / 2, height - 50, 
      'Scene transition successful! Click button to increase score.', {
      fontSize: '16px',
      color: '#888888',
      align: 'center'
    });
    hint.setOrigin(0.5);

    // 添加一些装饰性粒子效果
    this.createParticles();
  }

  updateStateDisplay() {
    const state = this.gameState;
    this.stateDisplay.setText(
      `Score: ${state.score}\n` +
      `Health: ${state.health}\n` +
      `Level: ${state.level}\n` +
      `Status: ${state.sceneActive ? 'Active' : 'Inactive'}`
    );
  }

  createParticles() {
    // 使用Graphics创建简单的粒子效果
    for (let i = 0; i < 20; i++) {
      const particle = this.add.graphics();
      particle.fillStyle(0x00ff00, 0.3);
      particle.fillCircle(0, 0, 3);
      
      const x = Phaser.Math.Between(0, this.cameras.main.width);
      const y = Phaser.Math.Between(0, this.cameras.main.height);
      particle.setPosition(x, y);

      // 添加浮动动画
      this.tweens.add({
        targets: particle,
        y: y - 50,
        alpha: 0,
        duration: 3000,
        repeat: -1,
        delay: Phaser.Math.Between(0, 2000)
      });
    }
  }

  update(time, delta) {
    // 可以在这里添加持续的游戏逻辑
  }
}

// 游戏配置
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#000000',
  scene: [LoadingScene, MainScene],
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 },
      debug: false
    }
  }
};

// 启动游戏
const game = new Phaser.Game(config);

// 导出游戏状态用于验证（可选）
if (typeof window !== 'undefined') {
  window.gameInstance = game;
  window.getGameState = () => {
    const mainScene = game.scene.getScene('MainScene');
    return mainScene ? mainScene.gameState : null;
  };
}