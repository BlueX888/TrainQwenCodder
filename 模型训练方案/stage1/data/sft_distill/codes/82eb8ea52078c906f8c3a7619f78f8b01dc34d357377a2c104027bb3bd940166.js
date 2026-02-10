// LoadingScene - 资源加载场景
class LoadingScene extends Phaser.Scene {
  constructor() {
    super('LoadingScene');
    this.loadingProgress = 0; // 可验证的加载进度状态
  }

  preload() {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    // 创建加载文本
    const loadingText = this.add.text(width / 2, height / 2 - 50, 'Loading...', {
      fontSize: '32px',
      color: '#ffffff'
    }).setOrigin(0.5);

    // 创建进度文本
    const progressText = this.add.text(width / 2, height / 2 + 50, '0%', {
      fontSize: '24px',
      color: '#ffffff'
    }).setOrigin(0.5);

    // 创建进度条背景（灰色）
    const progressBarBg = this.add.graphics();
    progressBarBg.fillStyle(0x222222, 1);
    progressBarBg.fillRect(width / 2 - 200, height / 2 - 10, 400, 30);

    // 创建进度条（粉色）
    const progressBar = this.add.graphics();

    // 监听加载进度事件
    this.load.on('progress', (value) => {
      this.loadingProgress = Math.floor(value * 100); // 更新可验证状态
      progressText.setText(`${this.loadingProgress}%`);
      
      // 绘制粉色进度条
      progressBar.clear();
      progressBar.fillStyle(0xff69b4, 1); // 粉色
      progressBar.fillRect(width / 2 - 200, height / 2 - 10, 400 * value, 30);
    });

    // 监听加载完成事件
    this.load.on('complete', () => {
      console.log('Loading complete! Progress:', this.loadingProgress);
    });

    // 模拟加载资源 - 使用程序化生成的纹理
    // 创建一些虚拟的base64图片来模拟加载过程
    const dummyImageData = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
    
    // 加载多个虚拟资源以展示进度条效果
    for (let i = 0; i < 10; i++) {
      this.load.image(`dummy${i}`, dummyImageData);
    }

    // 添加一些延迟来让进度条更明显
    this.load.on('filecomplete', () => {
      // 可以在这里添加每个文件加载完成的逻辑
    });
  }

  create() {
    // 验证加载完成状态
    console.log('LoadingScene create - Final progress:', this.loadingProgress);
    
    // 添加短暂延迟以展示100%状态
    this.time.delayedCall(500, () => {
      // 切换到主场景
      this.scene.start('MainScene', { 
        loadingProgress: this.loadingProgress,
        timestamp: Date.now()
      });
    });
  }
}

// MainScene - 主游戏场景
class MainScene extends Phaser.Scene {
  constructor() {
    super('MainScene');
    this.score = 0; // 可验证的分数状态
    this.level = 1; // 可验证的关卡状态
    this.health = 100; // 可验证的生命值状态
  }

  init(data) {
    // 接收从LoadingScene传递的数据
    console.log('MainScene initialized with data:', data);
    this.loadedProgress = data.loadingProgress || 0;
    this.loadTimestamp = data.timestamp || 0;
  }

  create() {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    // 设置背景色
    this.cameras.main.setBackgroundColor('#1a1a2e');

    // 显示标题
    this.add.text(width / 2, 80, 'Main Scene', {
      fontSize: '48px',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    // 显示加载信息
    this.add.text(width / 2, 150, `Loading Completed: ${this.loadedProgress}%`, {
      fontSize: '24px',
      color: '#ff69b4'
    }).setOrigin(0.5);

    // 显示状态信息
    this.statusText = this.add.text(width / 2, 220, this.getStatusText(), {
      fontSize: '20px',
      color: '#ffffff',
      align: 'center'
    }).setOrigin(0.5);

    // 创建一个可交互的方块（粉色）
    const square = this.add.graphics();
    square.fillStyle(0xff69b4, 1);
    square.fillRect(width / 2 - 50, height / 2 - 50, 100, 100);
    
    // 添加交互说明
    this.add.text(width / 2, height / 2 + 100, 'Click anywhere to increase score', {
      fontSize: '18px',
      color: '#aaaaaa'
    }).setOrigin(0.5);

    // 添加点击事件
    this.input.on('pointerdown', () => {
      this.score += 10;
      if (this.score % 50 === 0) {
        this.level++;
      }
      if (this.health < 100) {
        this.health += 5;
      }
      this.updateStatus();
    });

    // 创建一些装饰性的粉色圆点
    for (let i = 0; i < 5; i++) {
      const x = Phaser.Math.Between(50, width - 50);
      const y = Phaser.Math.Between(300, height - 50);
      const circle = this.add.graphics();
      circle.fillStyle(0xff69b4, 0.3);
      circle.fillCircle(x, y, 20);
    }

    // 添加返回加载场景的按钮
    const reloadButton = this.add.text(width / 2, height - 50, 'Reload Scene', {
      fontSize: '20px',
      color: '#ffffff',
      backgroundColor: '#ff69b4',
      padding: { x: 20, y: 10 }
    }).setOrigin(0.5).setInteractive();

    reloadButton.on('pointerdown', () => {
      this.scene.start('LoadingScene');
    });

    reloadButton.on('pointerover', () => {
      reloadButton.setScale(1.1);
    });

    reloadButton.on('pointerout', () => {
      reloadButton.setScale(1);
    });

    console.log('MainScene created - Initial state:', {
      score: this.score,
      level: this.level,
      health: this.health
    });
  }

  getStatusText() {
    return `Score: ${this.score}\nLevel: ${this.level}\nHealth: ${this.health}`;
  }

  updateStatus() {
    this.statusText.setText(this.getStatusText());
    console.log('Status updated:', {
      score: this.score,
      level: this.level,
      health: this.health
    });
  }
}

// Game 配置
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#000000',
  scene: [LoadingScene, MainScene], // 注册两个场景，LoadingScene为默认启动场景
  parent: 'game-container'
};

// 创建游戏实例
const game = new Phaser.Game(config);

// 导出可验证的游戏状态访问器（用于测试）
window.getGameState = function() {
  const mainScene = game.scene.getScene('MainScene');
  if (mainScene && mainScene.scene.isActive()) {
    return {
      score: mainScene.score,
      level: mainScene.level,
      health: mainScene.health,
      active: true
    };
  }
  
  const loadingScene = game.scene.getScene('LoadingScene');
  if (loadingScene && loadingScene.scene.isActive()) {
    return {
      loadingProgress: loadingScene.loadingProgress,
      active: true,
      scene: 'loading'
    };
  }
  
  return { active: false };
};